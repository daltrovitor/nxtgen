import { NextRequest, NextResponse } from "next/server";
import { userStore, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code && supabase) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        const email = data.user.email || "usuario.google@gmail.com";
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          email.split("@")[0];
        const avatarUrl =
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.picture;

        const user = userStore.findOrCreateGoogleUser(email, fullName, avatarUrl);
        const token = createSessionToken(user);

        const response = NextResponse.redirect(`${origin}/`);
        response.cookies.set({
          name: AUTH_COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });

        return response;
      }
    } catch (e) {
      console.error("Erro no callback do Google OAuth:", e);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}/`);
}
