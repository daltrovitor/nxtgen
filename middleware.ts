import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  // Ignore static assets, internal Next.js requests, API routes, and OAuth callbacks
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if host starts with adminng. (e.g. adminng.localhost:3000 or adminng.nxtgen.app)
  const isAdminSubdomain = host.startsWith("adminng.") || host.includes("adminng.");

  if (isAdminSubdomain) {
    // If user accesses the root of the admin subdomain, rewrite to /admin
    if (pathname === "/" || pathname === "") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    // Any direct route attempt on admin subdomain redirects to root /
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Check if host starts with partnerng. (e.g. partnerng.localhost:3000 or partnerng.nxtgen.app)
  const isPartnerSubdomain = host.startsWith("partnerng.") || host.includes("partnerng.");

  if (isPartnerSubdomain) {
    // If user accesses the root of the partner subdomain, rewrite to /partner
    if (pathname === "/" || pathname === "") {
      const url = req.nextUrl.clone();
      url.pathname = "/partner";
      return NextResponse.rewrite(url);
    }
    // Any direct route attempt on partner subdomain redirects to root /
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Main domain (or any other host):
  // Any attempt to access any route directly in the address bar redirects to /
  if (pathname !== "/" && pathname !== "") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

