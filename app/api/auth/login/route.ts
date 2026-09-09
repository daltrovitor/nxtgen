import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userStore, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Anti-Brute Force Rate Limiting: 5 attempts per minute per IP
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Muitas tentativas. Bloqueio de segurança temporário. Tente em ${rateCheck.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const email = sanitizeInput(parseResult.data.email.toLowerCase().trim());
    const password = parseResult.data.password;

    const user = userStore.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o e-mail e senha." },
        { status: 401 }
      );
    }

    const inputHash = userStore.hashPassword(password, user.salt);
    if (inputHash !== user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o e-mail e senha." },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        nxtScore: user.nxtScore,
        nxtLevel: user.nxtLevel,
        walletBalance: user.walletBalance,
        avatarUrl: user.avatarUrl,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro no processamento do login." },
      { status: 500 }
    );
  }
}
