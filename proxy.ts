import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LEGACY_REDIRECTS: Record<string, string> = {
  "/map": "/app/map",
  "/lines": "/app/lines",
  "/settings": "/app/settings",
  "/faulty": "/app/faulty",
  "/alerts": "/app/alerts",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (LEGACY_REDIRECTS[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = LEGACY_REDIRECTS[pathname];
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith("/lines/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/app${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|vehicles|sw.js).*)"],
};
