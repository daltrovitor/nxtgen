import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  // Ignore static assets and internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if host starts with adminng. (e.g. adminng.localhost:3000 or adminng.nxtgen.app)
  const isAdminSubdomain = host.startsWith("adminng.");

  if (isAdminSubdomain) {
    // If user accesses the root of the admin subdomain, rewrite to /admin
    if (pathname === "/" || pathname === "") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    // If already requesting /admin or subpaths, proceed
    if (!pathname.startsWith("/admin")) {
      const url = req.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
