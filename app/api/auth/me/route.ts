import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const cookieStore = await cookies();
  const rememberMe = cookieStore.get("nxtgen_remember")?.value !== "0";

  return NextResponse.json({
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
    rememberMe,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
