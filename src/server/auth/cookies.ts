import type { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const AUTH_COOKIE_NAME = "auth_token";

// Roughly matches JWT_EXPIRES_IN's default (7d) in seconds. The cookie's
// own max-age is a client-side hint; the token's embedded `exp` claim is
// the actual source of truth checked on every request.
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
