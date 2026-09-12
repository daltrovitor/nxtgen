-- ==============================================================================
-- NXTGEN DATABASE MIGRATION: NXT PASS, ADMIN CONTROL & STORAGE SETUP
-- Fix: Function get_current_user_role() returns TEXT to match character varying
-- Storage: Bucket 'benefits' for image uploads (logos and banners)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTION TO GET USER ROLE (FIXED: Returns TEXT to avoid type mismatch)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
    SELECT COALESCE(role::text, 'user') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. ENSURE PROFILES COLUMNS EXIST
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nxt_score INTEGER NOT NULL DEFAULT 250;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nxt_level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- 4. CATEGORIES TABLE (11 Verticals)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BENEFITS TABLE (Marketplace Real)
CREATE TABLE IF NOT EXISTS public.benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID,
    partner_name TEXT NOT NULL,
    partner_logo TEXT,
    partner_banner TEXT,
    partner_location TEXT NOT NULL DEFAULT 'São Paulo, SP',
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_label TEXT NOT NULL,
    min_nxt_level INTEGER NOT NULL DEFAULT 1,
    terms JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MISSIONS TABLE (Tarefas e Missões de XP)
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 150,
    total INTEGER NOT NULL DEFAULT 1,
    progress INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. VOUCHERS TABLE (Resgates e Auditoria)
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    benefit_id UUID REFERENCES public.benefits(id) ON DELETE CASCADE,
    benefit_title TEXT,
    partner_name TEXT,
    discount_label TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    user_name TEXT,
    status TEXT NOT NULL DEFAULT 'valid',
    qr_payload TEXT NOT NULL,
    terms TEXT,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Leitura pública
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

-- BENEFITS: Leitura pública de ativos, controle total para admins
DROP POLICY IF EXISTS "Public can view active benefits" ON public.benefits;
CREATE POLICY "Public can view active benefits" ON public.benefits FOR SELECT USING (is_active = true OR public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert benefits" ON public.benefits;
CREATE POLICY "Admins can insert benefits" ON public.benefits FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update benefits" ON public.benefits;
CREATE POLICY "Admins can update benefits" ON public.benefits FOR UPDATE USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete benefits" ON public.benefits;
CREATE POLICY "Admins can delete benefits" ON public.benefits FOR DELETE USING (public.get_current_user_role() = 'admin');

-- MISSIONS: Leitura pública, controle de admins
DROP POLICY IF EXISTS "Public can view missions" ON public.missions;
CREATE POLICY "Public can view missions" ON public.missions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage missions" ON public.missions;
CREATE POLICY "Admins can manage missions" ON public.missions FOR ALL USING (public.get_current_user_role() = 'admin');

-- VOUCHERS: Membro vê os seus; Admins vêem e gerenciam todos
DROP POLICY IF EXISTS "Users can view own vouchers" ON public.vouchers;
CREATE POLICY "Users can view own vouchers" ON public.vouchers FOR SELECT USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can create vouchers" ON public.vouchers;
CREATE POLICY "Users can create vouchers" ON public.vouchers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.vouchers;
CREATE POLICY "Admins can manage vouchers" ON public.vouchers FOR ALL USING (public.get_current_user_role() = 'admin');

-- ==============================================================================
-- 9. STORAGE SETUP: BUCKET 'benefits' PARA UPLOAD DE IMAGENS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('benefits', 'benefits', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view benefit images" ON storage.objects;
CREATE POLICY "Public can view benefit images" ON storage.objects
FOR SELECT USING (bucket_id = 'benefits');

DROP POLICY IF EXISTS "Authenticated users and admins can upload benefit images" ON storage.objects;
CREATE POLICY "Authenticated users and admins can upload benefit images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'benefits');

DROP POLICY IF EXISTS "Admins can update benefit images" ON storage.objects;
CREATE POLICY "Admins can update benefit images" ON storage.objects
FOR UPDATE USING (bucket_id = 'benefits');

DROP POLICY IF EXISTS "Admins can delete benefit images" ON storage.objects;
CREATE POLICY "Admins can delete benefit images" ON storage.objects
FOR DELETE USING (bucket_id = 'benefits');

-- ==============================================================================
-- 10. SEED APENAS AS 11 CATEGORIAS OFICIAIS (SEM BENEFÍCIOS FALSOS)
-- ==============================================================================
INSERT INTO public.categories (id, name, icon, description, display_order) VALUES
('gastronomia', 'Gastronomia', 'Utensils', 'Restaurantes, cafés e lanchonetes parceiras', 1),
('moda', 'Moda & Sneaker', 'Shirt', 'Marcas de streetwear, sneakers e acessórios', 2),
('tecnologia', 'Tecnologia', 'Laptop', 'Hardware, periféricos, setups e cursos tech', 3),
('viagens', 'Viagens & Hospedagem', 'Plane', 'Passagens, hostels, viagens e resorts', 4),
('educacao', 'Educação & Idiomas', 'GraduationCap', 'Cursos de alta performance, inglês e liderança', 5),
('esportes', 'Esportes & Fitness', 'Dumbbell', 'Academias, suplementos e arenas de beach tennis', 6),
('entretenimento', 'Entretenimento & Games', 'Gamepad2', 'Ingressos, cinema, eventos de games e streaming', 7),
('beleza', 'Beleza & Estética', 'Sparkles', 'Barbearias premium, skincare e estética', 8),
('saude-mental', 'Saúde Mental', 'Brain', 'Terapia online, mindfulness e desenvolvimento', 9),
('automoveis', 'Automóveis', 'Car', 'Aluguel de veículos, lavagem detalhada e mobilidade', 10),
('imoveis', 'Imóveis & Co-living', 'Home', 'Co-living para nômades digitais e locação flexível', 11)
ON CONFLICT (id) DO NOTHING;
