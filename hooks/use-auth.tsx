"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "partner" | "staff" | "admin";
  nxtScore: number;
  nxtLevel: number;
  walletBalance: number;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Falha no login" };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro de conexão" };
    }
  };

  const signup = async (fullName: string, email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Falha ao criar conta" };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro de conexão" };
    }
  };

  const loginWithGoogle = async () => {
    try {
      // 1. Try Supabase Google OAuth redirect if live client available
      try {
        const { supabase, isUsingLiveSupabase } = await import("@/lib/supabase/client");
        if (isUsingLiveSupabase && supabase) {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
            },
          });
          if (!error) return { success: true };
          console.warn("Supabase Google OAuth fallback triggered:", error.message);
        }
      } catch (supabaseErr) {
        console.warn("Supabase client import notice:", supabaseErr);
      }

      // 2. Direct Google Authentication Endpoint
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Falha ao autenticar com o Google" };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro ao conectar com o Google" };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
