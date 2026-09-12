import { NextRequest, NextResponse } from "next/server";
import { userStore, createSessionToken, AUTH_COOKIE_NAME, StoredUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha de administrador." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let authenticatedAdmin: StoredUser | null = null;

    // 1. Try Supabase Auth first
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.URL ||
      "https://ltiizrewiranhyrzbwds.supabase.co";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.ANON_KEY ||
      "";

    if (supabaseUrl && supabaseAnonKey && supabaseAnonKey.startsWith("eyJ")) {
      try {
        const client = createClient(supabaseUrl, supabaseAnonKey);
        const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!signInError && signInData?.user) {
          const authUser = signInData.user;
          let profileRole = "user";
          let fullName = authUser.user_metadata?.full_name || normalizedEmail.split("@")[0];
          let nxtScore = 250;
          let nxtLevel = 1;
          let avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80";
          let walletBalance = 0;

          if (supabaseAdmin) {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("*")
              .eq("id", authUser.id)
              .maybeSingle();

            if (profile) {
              profileRole = profile.role || "user";
              fullName = profile.full_name || fullName;
              nxtScore = profile.nxt_score ?? 250;
              nxtLevel = profile.nxt_level ?? 1;
              avatarUrl = profile.avatar_url || avatarUrl;
              walletBalance = Number(profile.wallet_balance ?? 0);
            }
          }

          // STRICT CHECK: Only users with role === 'admin' can login through the admin portal
          if (profileRole !== "admin") {
            return NextResponse.json(
              {
                error: "Acesso negado. Esta conta não possui privilégios de administrador.",
                role: profileRole,
              },
              { status: 403 }
            );
          }

          authenticatedAdmin = {
            id: authUser.id,
            email: authUser.email || normalizedEmail,
            fullName,
            passwordHash: "",
            salt: "",
            role: "admin",
            nxtScore,
            nxtLevel,
            avatarUrl,
            walletBalance,
            emailConfirmed: true,
            createdAt: authUser.created_at || new Date().toISOString(),
          };
        }
      } catch (authErr) {
        console.warn("Supabase admin signIn error:", authErr);
      }
    }

    // 2. Fallback to in-memory store (e.g. demo users)
    if (!authenticatedAdmin) {
      const demoUser = userStore.findByEmail(normalizedEmail);
      if (demoUser) {
        const computedHash = userStore.hashPassword(password, demoUser.salt);
        if (computedHash === demoUser.passwordHash) {
          if (demoUser.role !== "admin") {
            return NextResponse.json(
              {
                error: "Acesso negado. Esta conta não possui privilégios de administrador.",
                role: demoUser.role,
              },
              { status: 403 }
            );
          }
          authenticatedAdmin = demoUser;
        }
      }
    }

    if (!authenticatedAdmin) {
      return NextResponse.json(
        { error: "Credenciais inválidas ou conta inexistente." },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken(authenticatedAdmin, 7 * 24 * 60 * 60);

    const response = NextResponse.json({
      success: true,
      message: "Login administrativo realizado com sucesso.",
      user: {
        id: authenticatedAdmin.id,
        email: authenticatedAdmin.email,
        name: authenticatedAdmin.fullName,
        role: authenticatedAdmin.role,
        nxtLevel: authenticatedAdmin.nxtLevel,
        nxtScore: authenticatedAdmin.nxtScore,
      },
      rememberMe: true,
    });

    response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    response.cookies.set("nxtgen_remember", "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro no processamento do login administrativo." },
      { status: 500 }
    );
  }
}
