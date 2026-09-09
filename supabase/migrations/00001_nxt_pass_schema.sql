-- ==============================================================================
-- NXTGEN SUPABASE DATABASE SCHEMA: NXT PASS & FOUNDATION ARCHITECTURE
-- Hardened Security, Complete Row Level Security (RLS) & Anti-Fraud Structure
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'partner', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partner_status AS ENUM ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'ATIVO', 'SUSPENSO', 'BLOQUEADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE voucher_status AS ENUM ('valid', 'used', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'authorized', 'paid', 'failed', 'refunded', 'chargeback');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    phone TEXT,
    nxt_score INTEGER NOT NULL DEFAULT 150,
    nxt_level INTEGER NOT NULL DEFAULT 1,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PARTNERS TABLE (Clube de Benefícios Sellers)
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_name TEXT,
    document TEXT, -- CPF / CNPJ
    category_id TEXT NOT NULL REFERENCES public.categories(id),
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    location TEXT NOT NULL,
    rating NUMERIC(3, 1) NOT NULL DEFAULT 4.9,
    status partner_status NOT NULL DEFAULT 'ATIVO',
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.00, -- 10% default platform commission
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BENEFITS TABLE (Marketplace de Benefícios)
CREATE TABLE IF NOT EXISTS public.benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_label TEXT NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed_amount, exclusive
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    original_price NUMERIC(10, 2),
    promotional_price NUMERIC(10, 2),
    terms TEXT,
    usage_limit_per_user INTEGER NOT NULL DEFAULT 1,
    total_available INTEGER NOT NULL DEFAULT 500,
    total_used INTEGER NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. VOUCHERS / BENEFIT REDEMPTIONS (QR Code Dinâmico Anti-Fraude)
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- ID_DO_COMPROVANTE
    hmac_signature TEXT NOT NULL, -- Anti-tampering signature
    benefit_id UUID NOT NULL REFERENCES public.benefits(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status voucher_status NOT NULL DEFAULT 'valid',
    qr_payload TEXT NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ORDERS & SPLIT TRANSACTIONS (Payment Orchestration Layer - POL)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.partners(id),
    benefit_id UUID REFERENCES public.benefits(id),
    amount NUMERIC(10, 2) NOT NULL,
    partner_amount NUMERIC(10, 2) NOT NULL,
    platform_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    psp_provider TEXT NOT NULL DEFAULT 'pagarme',
    psp_transaction_id TEXT,
    pix_qr_code TEXT,
    pix_copy_paste TEXT,
    status order_status NOT NULL DEFAULT 'pending',
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- CATEGORIES POLICIES (Public read)
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" 
ON public.categories FOR SELECT 
USING (true);

-- PARTNERS POLICIES (Active partners public read)
DROP POLICY IF EXISTS "Public can view active partners" ON public.partners;
CREATE POLICY "Public can view active partners" 
ON public.partners FOR SELECT 
USING (status = 'ATIVO' OR owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Partners can update own info" ON public.partners;
CREATE POLICY "Partners can update own info" 
ON public.partners FOR UPDATE 
USING (owner_id = auth.uid() OR public.get_current_user_role() = 'admin');

-- BENEFITS POLICIES (Active benefits public read)
DROP POLICY IF EXISTS "Public can view active benefits" ON public.benefits;
CREATE POLICY "Public can view active benefits" 
ON public.benefits FOR SELECT 
USING (is_active = true OR public.get_current_user_role() = 'admin');

-- VOUCHERS POLICIES (Extreme Security & Privacy)
DROP POLICY IF EXISTS "Users view own vouchers" ON public.vouchers;
CREATE POLICY "Users view own vouchers" 
ON public.vouchers FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners view own redeemed vouchers" ON public.vouchers;
CREATE POLICY "Partners view own redeemed vouchers" 
ON public.vouchers FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.partners 
        WHERE partners.id = vouchers.partner_id 
        AND (partners.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
    )
);

DROP POLICY IF EXISTS "Users can create voucher redemption" ON public.vouchers;
CREATE POLICY "Users can create voucher redemption" 
ON public.vouchers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Partners view their store orders" ON public.orders;
CREATE POLICY "Partners view their store orders" 
ON public.orders FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.partners 
        WHERE partners.id = orders.partner_id 
        AND (partners.owner_id = auth.uid() OR public.get_current_user_role() = 'admin')
    )
);

-- ==============================================================================
-- 10. SEED INITIAL NXT PASS CATEGORIES
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
