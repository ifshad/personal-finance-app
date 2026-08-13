import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/server/services/auth.service";
import { setAuthCookie } from "@/server/auth/cookies";

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const input = registerSchema.parse(body);

  const { user, token } = await registerUser(input);

  const response = apiSuccess({ user }, { status: 201 });
  setAuthCookie(response, token);
  return response;
});
