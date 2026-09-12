-- ==============================================================================
-- NXTGEN DATABASE MIGRATION 00003: MISSIONS, PROGRESS & FRIEND REFERRALS
-- Suporte completo a Aceitação de Missões, Verificação e Member Get Member
-- ==============================================================================

-- 1. ADICIONAR COLUNAS NA TABELA MISSIONS
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'manual';
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'NXTGEN';

-- 2. TABELA DE INDICAÇÃO DE AMIGOS (REFERRALS)
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas ultra-rápidas
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);

-- 3. TABELA DE MISSÕES DO USUÁRIO (USER_MISSIONS)
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    is_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    progress INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission_id ON public.user_missions(mission_id);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- REFERRALS POLICIES
DROP POLICY IF EXISTS "Users can view referrals they are involved in" ON public.referrals;
CREATE POLICY "Users can view referrals they are involved in"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can insert referral for themselves" ON public.referrals;
CREATE POLICY "Users can insert referral for themselves"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referred_user_id);

-- USER_MISSIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own missions" ON public.user_missions;
CREATE POLICY "Users can view their own missions"
ON public.user_missions FOR SELECT
USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can insert their own accepted missions" ON public.user_missions;
CREATE POLICY "Users can insert their own accepted missions"
ON public.user_missions FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own missions" ON public.user_missions;
CREATE POLICY "Users can update their own missions"
ON public.user_missions FOR UPDATE
USING (auth.uid() = user_id OR public.get_current_user_role() = 'admin');
