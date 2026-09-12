import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "Nenhuma sessão ativa." },
        { status: 401 }
      );
    }

    const verification = verifySessionToken(token);
    if (!verification.valid || !verification.payload) {
      return NextResponse.json(
        { authenticated: false, error: "Sessão expirada ou inválida." },
        { status: 401 }
      );
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { authenticated: false, error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        {
          authenticated: true,
          isAdmin: false,
          error: "Acesso negado. Usuário sem privilégios administrativos.",
          user: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.fullName,
            role: currentUser.role,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      isAdmin: true,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.fullName,
        role: currentUser.role,
        nxtLevel: currentUser.nxtLevel,
        nxtScore: currentUser.nxtScore,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar sessão administrativa." },
      { status: 500 }
    );
  }
}
