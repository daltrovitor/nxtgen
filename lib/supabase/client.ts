import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.URL ||
  "https://ltiizrewiranhyrzbwds.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.ANON_KEY ||
  "";

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  "";

export const isLiveConfigured =
  Boolean(supabaseAnonKey) &&
  !supabaseAnonKey.includes("placeholder") &&
  supabaseAnonKey.startsWith("eyJ");

export const isUsingLiveSupabase = isLiveConfigured;

// Browser / Client SDK with SSR cookie storage for PKCE OAuth
export const supabase = isLiveConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server / Admin SDK for secure direct user creation without email confirmation
export const supabaseAdmin =
  supabaseServiceRoleKey && supabaseServiceRoleKey.startsWith("eyJ")
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
