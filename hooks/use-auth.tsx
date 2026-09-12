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
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
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
      const isRemembered = typeof window !== "undefined" && localStorage.getItem("nxtgen_remember_me") === "true";
      const isTabActive = typeof window !== "undefined" && sessionStorage.getItem("nxtgen_tab_active") === "true";

      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const serverRemembered = typeof data.rememberMe === "boolean" ? data.rememberMe : isRemembered;
          // If the user did not check "lembrar de mim" and left/closed the page:
          if (!serverRemembered && !isTabActive) {
            await fetch("/api/auth/logout", { method: "POST" });
            if (typeof window !== "undefined") {
              localStorage.removeItem("nxtgen_remember_me");
              sessionStorage.removeItem("nxtgen_tab_active");
            }
            setUser(null);
            setLoading(false);
            return;
          }

          if (typeof window !== "undefined") {
            sessionStorage.setItem("nxtgen_tab_active", "true");
            if (serverRemembered) {
              localStorage.setItem("nxtgen_remember_me", "true");
            } else {
              localStorage.removeItem("nxtgen_remember_me");
            }
          }
          setUser(data.user);
          setLoading(false);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Falha no login" };
      }

      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("nxtgen_remember_me", "true");
        } else {
          localStorage.removeItem("nxtgen_remember_me");
        }
        sessionStorage.setItem("nxtgen_tab_active", "true");
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

      if (typeof window !== "undefined") {
        localStorage.setItem("nxtgen_remember_me", "true");
        sessionStorage.setItem("nxtgen_tab_active", "true");
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro de conexão" };
    }
  };

  const loginWithGoogle = async (rememberMe: boolean = true) => {
    try {
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("nxtgen_remember_me", "true");
          document.cookie = "nxtgen_remember_pending=1; path=/; max-age=1800; SameSite=Lax";
        } else {
          localStorage.removeItem("nxtgen_remember_me");
          document.cookie = "nxtgen_remember_pending=0; path=/; max-age=1800; SameSite=Lax";
        }
        sessionStorage.setItem("nxtgen_tab_active", "true");
      }

      const { supabase, isUsingLiveSupabase } = await import("@/lib/supabase/client");
      if (isUsingLiveSupabase && supabase) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data?.url && typeof window !== "undefined") {
          window.location.href = data.url;
        }
        return { success: true };
      }

      // Fallback demo endpoint if Supabase client not present
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rememberMe }),
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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nxtgen_remember_me");
        sessionStorage.removeItem("nxtgen_tab_active");
      }
      setUser(null);
    }
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
