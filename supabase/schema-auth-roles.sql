-- ============================================================================
-- NXTGEN SECURE AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) SCHEMA
-- ============================================================================
-- Este script define a estrutura completa de autenticação, perfis e segurança.
-- Usuários comuns que criam conta recebem role = 'user' por padrão.
-- Apenas usuários que você explicitamente alterar para role = 'admin'
-- terão permissão e acesso liberado ao Dashboard Administrativo (/admin).
-- ============================================================================

-- 1. Criação da Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  
  -- Coluna OBRIGATÓRIA: 'role' ('user' para usuários normais, 'admin' para administradores)
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  
  birth_date DATE,
  nxt_score INTEGER NOT NULL DEFAULT 250,
  nxt_level INTEGER NOT NULL DEFAULT 1,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80',
  wallet_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Função Auxiliar de Segurança: Verifica se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Políticas de Segurança RLS (Row Level Security)

-- A) VISUALIZAÇÃO:
-- Usuários comuns podem visualizar apenas o seu próprio perfil.
-- Administradores (role = 'admin') podem visualizar TODOS os perfis do sistema.
DROP POLICY IF EXISTS "Perfis: Visualização própria ou total para admin" ON public.profiles;
CREATE POLICY "Perfis: Visualização própria ou total para admin"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    public.is_admin() = true
  );

-- B) ATUALIZAÇÃO POR USUÁRIO COMUM:
-- Usuário comum pode alterar seus dados (nome, foto), mas NÃO pode alterar a coluna 'role'
DROP POLICY IF EXISTS "Perfis: Atualização própria protegida" ON public.profiles;
CREATE POLICY "Perfis: Atualização própria protegida"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Impede auto-promoção: a coluna 'role' enviada deve ser idêntica à que ele já tem
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR
      public.is_admin() = true
    )
  );

-- C) GESTÃO TOTAL POR ADMINS:
-- Administradores têm permissão para atualizar a coluna 'role' e gerenciar qualquer perfil
DROP POLICY IF EXISTS "Perfis: Controle total para admins" ON public.profiles;
CREATE POLICY "Perfis: Controle total para admins"
  ON public.profiles
  FOR ALL
  USING (public.is_admin() = true);

-- D) ACESSO TOTAL PELO SERVICE ROLE (BACKEND/SUPABASE API):
DROP POLICY IF EXISTS "Perfis: Service role irrestrito" ON public.profiles;
CREATE POLICY "Perfis: Service role irrestrito"
  ON public.profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. Trigger Automático para Novos Cadastros (Sempre cria com role = 'user')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role, -- Garantia de criação padrão como 'user'
    birth_date,
    nxt_score,
    nxt_level,
    avatar_url,
    wallet_balance
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Membro NXTGEN'),
    'user', -- Todo usuário comum nasce com role 'user'
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::date 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'nxt_score')::integer, 250),
    COALESCE((NEW.raw_user_meta_data->>'nxt_level')::integer, 1),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80'),
    COALESCE((NEW.raw_user_meta_data->>'wallet_balance')::numeric, 0.00)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Registra a trigger na tabela de autenticação do Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TABELA DE LOGS DE AUDITORIA & ACESSO ADMINISTRATIVO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  event TEXT NOT NULL, -- 'login', 'signup', 'admin_access', 'role_change', 'unauthorized_attempt'
  role_snapshot VARCHAR(20) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

-- Usuários só veem seus próprios logs, Administradores veem todos os logs
DROP POLICY IF EXISTS "Logs: Leitura própria ou admin" ON public.auth_audit_logs;
CREATE POLICY "Logs: Leitura própria ou admin"
  ON public.auth_audit_logs
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    public.is_admin() = true
  );

-- ============================================================================
-- COMANDOS PRONTOS PARA VOCÊ EXECUTAR E GERENCIAR ROLES:
-- ============================================================================

-- 1. PROMOVER UM USUÁRIO A ADMIN (Libera o Dashboard de Admin):
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'seu_email@exemplo.com';

-- 2. REBAIXAR UM ADMIN DE VOLTA A USUÁRIO COMUM:
-- UPDATE public.profiles
-- SET role = 'user'
-- WHERE email = 'seu_email@exemplo.com';

-- 3. LISTAR TODOS OS ADMINISTRADORES DO SISTEMA:
-- SELECT id, email, full_name, role, created_at
-- FROM public.profiles
-- WHERE role = 'admin';

-- 4. LISTAR USUÁRIOS COMUNS:
-- SELECT id, email, full_name, role, nxt_level, nxt_score, created_at
-- FROM public.profiles
-- WHERE role = 'user'
-- ORDER BY created_at DESC;
