import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userStore, createSessionToken, AUTH_COOKIE_NAME, StoredUser } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase/client";

const SignupSchema = z.object({
  fullName: z.string().min(2, "Nome completo é obrigatório"),
  email: z.string().email("E-mail corporativo ou pessoal válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  birthDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = SignupSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    // Regra Fundamental NXTGEN: Máximo 29 anos (Gerações Alpha e Z)
    if (body.birthDate) {
      const birth = new Date(body.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age > 29) {
        return NextResponse.json(
          { error: "O ecossistema NXTGEN é exclusivo para jovens até 29 anos (Gerações Alpha e Z)." },
          { status: 403 }
        );
      }
    }

    const fullName = sanitizeInput(parseResult.data.fullName);
    const email = sanitizeInput(parseResult.data.email.toLowerCase().trim());
    const password = parseResult.data.password;

    let userId = "";
    const nxtScore = 250;
    const nxtLevel = 1;
    const walletBalance = 0;
    const avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80";

    if (supabaseAdmin) {
      // 1. Create user directly in Supabase Auth with email pre-confirmed
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: "user",
          nxt_score: nxtScore,
          nxt_level: nxtLevel,
          wallet_balance: walletBalance,
        },
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("unique") || msg.includes("exists")) {
          return NextResponse.json(
            { error: "Este e-mail já está cadastrado no sistema." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: authError.message || "Erro ao criar usuário no Supabase." },
          { status: 400 }
        );
      }

      if (!authData?.user) {
        return NextResponse.json(
          { error: "Falha ao registrar usuário." },
          { status: 500 }
        );
      }

      userId = authData.user.id;

      // 2. Guarantee profile row is saved in public.profiles
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: userId,
            email,
            full_name: fullName,
            role: "user",
            nxt_score: nxtScore,
            nxt_level: nxtLevel,
            wallet_balance: walletBalance,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.warn("Notice: public.profiles upsert warning:", profileError.message);
      }
    } else {
      // In-memory fallback if Supabase keys are not present
      const newUser = userStore.createUser(email, fullName, password);
      userId = newUser.id;
    }

    const sessionUser: StoredUser = {
      id: userId,
      email,
      fullName,
      passwordHash: "",
      salt: "",
      role: "user",
      nxtScore,
      nxtLevel,
      avatarUrl,
      walletBalance,
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
    };

    const oneYearSeconds = 365 * 24 * 60 * 60;
    const token = createSessionToken(sessionUser, oneYearSeconds);

    const response = NextResponse.json({
      success: true,
      message: "Conta criada e ativada imediatamente com sucesso!",
      user: {
        id: userId,
        email,
        name: fullName,
        role: "user",
        nxtScore,
        nxtLevel,
        walletBalance,
        avatarUrl,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: oneYearSeconds,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao registrar conta." },
      { status: 400 }
    );
  }
}
