import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "@/lib/env";

const secretKey = new TextEncoder().encode(env.JWT_SECRET);
const ALGORITHM = "HS256";

/**
 * Claims embedded in the auth token. The role name is embedded so
 * authorization checks don't need a database round trip on every request.
 * Changing a user's role only takes effect on their next login — acceptable
 * for MVP since there is no admin panel yet to change roles at runtime.
 */
export type AuthTokenPayload = JWTPayload & {
  sub: string; // user id, as a string per JWT spec
  email: string;
  role: string;
};

export async function signAuthToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secretKey);
}

/**
 * Verifies a token's signature and expiry and returns its payload.
 * Returns `null` on any failure (expired, malformed, wrong signature)
 * rather than throwing, so callers can treat "no valid session" uniformly.
 */
export async function verifyAuthToken(
  token: string,
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [ALGORITHM],
    });
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}
