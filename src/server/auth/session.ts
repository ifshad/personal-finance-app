import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/api-error";
import { AUTH_COOKIE_NAME } from "./cookies";
import { verifyAuthToken } from "./jwt";

/** The authenticated user derived from a verified request cookie. */
export type AuthContext = {
  userId: number;
  email: string;
  role: string;
};

/**
 * Reads and verifies the auth cookie on an incoming request, returning the
 * authenticated user context or `null` if there is no valid session.
 *
 * This is the ONLY place a route handler should derive "who is the current
 * user" from — never trust a client-supplied user id in a request body or
 * query string.
 */
export async function getOptionalUser(
  request: NextRequest,
): Promise<AuthContext | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload) return null;

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId)) return null;

  return { userId, email: payload.email, role: payload.role };
}

/**
 * Same as `getOptionalUser`, but throws an `ApiError` (401) when there is
 * no valid session. Use this at the top of every protected route handler.
 */
export async function requireUser(request: NextRequest): Promise<AuthContext> {
  const user = await getOptionalUser(request);
  if (!user) {
    throw ApiError.unauthenticated();
  }
  return user;
}

/** Throws a 403 if the authenticated user does not have the given role. */
export function requireRole(user: AuthContext, role: string): void {
  if (user.role !== role) {
    throw ApiError.forbidden();
  }
}

/**
 * Same as `getOptionalUser`, but for use in Server Components / layouts,
 * which read cookies via `next/headers` instead of a `NextRequest`.
 */
export async function getServerAuthUser(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload) return null;

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId)) return null;

  return { userId, email: payload.email, role: payload.role };
}
