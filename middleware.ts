import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Middleware that:
 * 1. Redirects www → non-www with a 301 (permanent) redirect
 * 2. Protects /admin/* routes via NextAuth
 */
export default async function middleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;

  // ── www → non-www redirect (301 permanent) ──────────────────────────
  // Handles both www.vixn.fun and any www. prefix
  if (hostname.startsWith("www.")) {
    const nonWwwHost = hostname.replace(/^www\./, "");
    const url = request.nextUrl.clone();
    url.hostname = nonWwwHost;
    // Preserve the original path and query string
    url.pathname = pathname;
    url.search = search;
    return NextResponse.redirect(url, 301);
  }

  // ── Auth protection for admin routes ─────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Delegate to NextAuth middleware for admin routes
    return (auth as any)(request);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes so www redirect works everywhere,
  // but exclude static assets and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-|apple-|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
