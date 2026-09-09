-- ============================================================================
-- NXTGEN SECURE AUTHENTICATION SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- 1. Create PROFILES table linked directly to Supabase auth.users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  full_name text not null,
  birth_date date,
  nxt_score integer not null default 250,
  nxt_level integer not null default 1,
  avatar_url text default 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80',
  wallet_balance numeric(10,2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Security Policies for PROFILES
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update only their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Service role full access on profiles" on public.profiles;
create policy "Service role full access on profiles"
  on public.profiles
  for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- 4. Create AUTH_AUDIT_LOGS table for security tracking (impenetrable)
create table if not exists public.auth_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  event text not null, -- 'login', 'signup', 'logout', 'failed_attempt'
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on audit logs
alter table public.auth_logs enable row level security;

-- Only users can view their own auth logs
create policy "Users view own auth logs"
  on public.auth_logs
  for select
  using (auth.uid() = user_id);

-- Service role can insert & manage logs
create policy "Service role manage auth logs"
  on public.auth_logs
  for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- 5. Automatic Profile Trigger on Auth Signup (Instant Active, No Email Confirm)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    birth_date,
    nxt_score,
    nxt_level,
    avatar_url,
    wallet_balance
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Membro NXTGEN'),
    case 
      when new.raw_user_meta_data->>'birth_date' is not null 
      then (new.raw_user_meta_data->>'birth_date')::date 
      else null 
    end,
    coalesce((new.raw_user_meta_data->>'nxt_score')::integer, 250),
    coalesce((new.raw_user_meta_data->>'nxt_level')::integer, 1),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80'),
    coalesce((new.raw_user_meta_data->>'wallet_balance')::numeric, 0.00)
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
