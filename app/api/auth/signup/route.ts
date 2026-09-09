import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userStore, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";

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
        { error: parseResult.error.errors[0].message },
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
    const email = sanitizeInput(parseResult.data.email);
    const password = parseResult.data.password;

    // Create user with instant auto-confirmation (no verification email needed!)
    const newUser = userStore.createUser(email, fullName, password);
    const token = createSessionToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: "Conta criada e ativada imediatamente com sucesso!",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.fullName,
        role: newUser.role,
        nxtScore: newUser.nxtScore,
        nxtLevel: newUser.nxtLevel,
        walletBalance: newUser.walletBalance,
        avatarUrl: newUser.avatarUrl,
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
      { error: error.message || "Erro ao registrar conta." },
      { status: 400 }
    );
  }
}
