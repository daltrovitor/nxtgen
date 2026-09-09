import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { userStore, verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado. Faça login para continuar." },
        { status: 401 }
      );
    }

    const { valid, payload } = verifySessionToken(token);
    if (!valid || !payload) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    // STRICT ROLE VERIFICATION: Only users with role === 'admin' can access
    if (payload.role !== "admin") {
      return NextResponse.json(
        {
          error: "Acesso Negado. Esta área requer privilégios de administrador (role = 'admin').",
          userRole: payload.role,
        },
        { status: 403 }
      );
    }

    const users = userStore.getAllUsers().map((u) => ({
      id: u.id,
      email: u.email,
      name: u.fullName,
      role: u.role,
      nxtScore: u.nxtScore,
      nxtLevel: u.nxtLevel,
      walletBalance: u.walletBalance,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      currentUserRole: payload.role,
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar usuários." },
      { status: 500 }
    );
  }
}
