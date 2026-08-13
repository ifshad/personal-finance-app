import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/server/auth/cookies";
import { verifyAuthToken } from "@/server/auth/jwt";

// Pages that must NOT require a session. Everything else under the matcher
// below is treated as a protected app page.
const PUBLIC_PATHS = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyAuthToken(token) : null;

  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (!isPublicPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on every page route except API routes, static assets, and Next.js
  // internals. API routes protect themselves via requireUser().
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
