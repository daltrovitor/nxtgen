import { NextResponse } from "next/server";
import { getCurrentUser, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

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
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
