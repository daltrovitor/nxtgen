import { NextRequest, NextResponse } from "next/server";
import { userStore, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha de administrador." },
        { status: 400 }
      );
    }

    const user = userStore.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas ou conta inexistente." },
        { status: 401 }
      );
    }

    const salt = user.salt;
    const computedHash = userStore.hashPassword(password, salt);
    if (computedHash !== user.passwordHash) {
      return NextResponse.json(
        { error: "Senha incorreta." },
        { status: 401 }
      );
    }

    // STRICT CHECK: Only users with role === 'admin' can login through the admin portal
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Acesso negado. Esta conta não possui privilégios de administrador.",
          role: user.role,
        },
        { status: 403 }
      );
    }

    const sessionToken = createSessionToken(user, 7 * 24 * 60 * 60);

    const response = NextResponse.json({
      success: true,
      message: "Login administrativo realizado com sucesso.",
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        nxtLevel: user.nxtLevel,
        nxtScore: user.nxtScore,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
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
