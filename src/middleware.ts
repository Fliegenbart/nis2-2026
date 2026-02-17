import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for login pages, auth APIs, and static assets
  if (
    pathname === "/login" ||
    pathname === "/consultant/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/consultant/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Let API routes handle auth and return proper JSON errors.
  // Redirecting API requests to /login breaks client-side fetch flows.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check for site-wide auth cookie
  const authCookie = request.cookies.get("site-auth");
  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Consultant routes don't use i18n middleware
  if (pathname.startsWith("/consultant")) {
    return NextResponse.next();
  }

  // For all other routes, apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
