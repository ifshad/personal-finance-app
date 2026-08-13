import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { requireUser } from "@/server/auth/session";
import { updateProfileSchema } from "@/lib/validation/profile";
import { updateCurrentUserProfile } from "@/server/services/profile.service";

export const PATCH = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const body = await request.json();
  const input = updateProfileSchema.parse(body);

  const user = await updateCurrentUserProfile(auth.userId, input);
  return apiSuccess({ user });
});
