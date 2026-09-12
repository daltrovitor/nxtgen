-- ============================================================================
-- MIGRATION: UPDATE PROFILES ROLE CHECK CONSTRAINT
-- ============================================================================
-- Permite os papéis 'user', 'partner', 'staff' e 'admin' na tabela public.profiles
-- ============================================================================

-- 1. Remove a constraint restritiva antiga que só aceitava 'user' e 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Recria a constraint com suporte completo ao papel 'partner' e 'staff'
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'partner', 'staff', 'admin'));

-- 3. Atualiza o usuário narug1fps@gmail.com para 'partner' se desejado
-- UPDATE public.profiles SET role = 'partner' WHERE email = 'narug1fps@gmail.com';
