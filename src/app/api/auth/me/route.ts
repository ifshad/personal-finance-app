import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { requireUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const user = await getCurrentUser(auth.userId);
  return apiSuccess({ user });
});
