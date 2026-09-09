import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ltiizrewiranhyrzbwds.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isLiveConfigured = 
  Boolean(supabaseAnonKey) && 
  !supabaseAnonKey.includes("placeholder") && 
  supabaseAnonKey.startsWith("eyJ");

export const isUsingLiveSupabase = isLiveConfigured;

export const supabase = isLiveConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
