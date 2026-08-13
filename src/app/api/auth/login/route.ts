import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { loginSchema } from "@/lib/validation/auth";
import { loginUser } from "@/server/services/auth.service";
import { setAuthCookie } from "@/server/auth/cookies";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const input = loginSchema.parse(body);

  const { user, token } = await loginUser(input);

  const response = apiSuccess({ user });
  setAuthCookie(response, token);
  return response;
});
