import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { clearAuthCookie } from "@/server/auth/cookies";

export const POST = withApiErrorHandling(async () => {
  const response = apiSuccess({ loggedOut: true });
  clearAuthCookie(response);
  return response;
});
