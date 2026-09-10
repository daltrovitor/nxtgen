import { NextRequest, NextResponse } from "next/server";
import { userStore, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

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

    const user = userStore.findOrCreateGoogleUser(email, name, avatarUrl);
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Falha na autenticação com o Google." },
      { status: 500 }
    );
  }
}
