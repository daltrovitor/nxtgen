import { NextRequest, NextResponse } from "next/server";
import { userStore, createSessionToken, AUTH_COOKIE_NAME, StoredUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const email = (body.email || "usuario.google@gmail.com").toLowerCase().trim();
    const name = (body.name || body.fullName || "Usuário Google").trim();
    const avatarUrl = body.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80";

    let authenticatedUser: StoredUser | null = null;

    if (supabaseAdmin) {
      try {
        // Check if user already exists in profiles
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (existingProfile) {
          authenticatedUser = {
            id: existingProfile.id,
            email: existingProfile.email,
            fullName: existingProfile.full_name || name,
            passwordHash: "",
            salt: "",
            role: existingProfile.role || "user",
            nxtScore: existingProfile.nxt_score ?? 300,
            nxtLevel: existingProfile.nxt_level ?? 1,
            avatarUrl: existingProfile.avatar_url || avatarUrl,
            walletBalance: Number(existingProfile.wallet_balance ?? 0),
            emailConfirmed: true,
            createdAt: existingProfile.created_at || new Date().toISOString(),
          };
        } else {
          // Create in auth.users
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: "GoogleAuthToken_" + Math.random().toString(36).slice(2) + "!",
            email_confirm: true,
            user_metadata: {
              full_name: name,
              role: "user",
              avatar_url: avatarUrl,
              nxt_score: 300,
              nxt_level: 1,
              wallet_balance: 0,
            },
          });

          if (!authError && authData?.user) {
            const uid = authData.user.id;
            await supabaseAdmin.from("profiles").upsert(
              {
                id: uid,
                email,
                full_name: name,
                avatar_url: avatarUrl,
                role: "user",
                nxt_score: 300,
                nxt_level: 1,
                wallet_balance: 0.0,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );

            authenticatedUser = {
              id: uid,
              email,
              fullName: name,
              passwordHash: "",
              salt: "",
              role: "user",
              nxtScore: 300,
              nxtLevel: 1,
              avatarUrl,
              walletBalance: 0,
              emailConfirmed: true,
              createdAt: new Date().toISOString(),
            };
          }
        }
      } catch (sbErr) {
        console.warn("Supabase Google auth fallback:", sbErr);
      }
    }

    const rememberMe = body.rememberMe !== false;

    if (!authenticatedUser) {
      const user = userStore.findOrCreateGoogleUser(email, name, avatarUrl);
      authenticatedUser = user;
    }

    const tokenExpSeconds = rememberMe ? 365 * 24 * 60 * 60 : 24 * 60 * 60;
    const token = createSessionToken(authenticatedUser, tokenExpSeconds);

    const response = NextResponse.json({
      success: true,
      rememberMe,
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.fullName,
        role: authenticatedUser.role,
        nxtScore: authenticatedUser.nxtScore,
        nxtLevel: authenticatedUser.nxtLevel,
        walletBalance: authenticatedUser.walletBalance,
        avatarUrl: authenticatedUser.avatarUrl,
      },
    });

    const cookieOptions: any = {
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    if (rememberMe) {
      cookieOptions.maxAge = 365 * 24 * 60 * 60;
    }

    response.cookies.set(cookieOptions);

    response.cookies.set({
      name: "nxtgen_remember",
      value: rememberMe ? "1" : "0",
      path: "/",
      sameSite: "lax",
      maxAge: rememberMe ? 365 * 24 * 60 * 60 : undefined,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Falha na autenticação com o Google." },
      { status: 500 }
    );
  }
}
