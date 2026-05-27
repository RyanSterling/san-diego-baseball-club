import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "team-fund-auth";
const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-please-set-env-var"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /team-fund routes (except login)
  if (pathname.startsWith("/team-fund") && !pathname.startsWith("/team-fund/login")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/team-fund/login", request.url));
    }

    try {
      await jwtVerify(token, AUTH_SECRET);
    } catch {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/team-fund/login", request.url));
    }
  }

  // Protect /admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, AUTH_SECRET);
    } catch {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/team-fund/:path*", "/admin/:path*"],
};
