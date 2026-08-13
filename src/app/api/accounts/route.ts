import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { requireUser } from "@/server/auth/session";
import { createAccountSchema } from "@/lib/validation/accounts";
import { createAccountForUser, listAccountsForUser } from "@/server/services/accounts.service";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const activeOnly = request.nextUrl.searchParams.get("activeOnly") === "true";

  const result = await listAccountsForUser(auth.userId, { activeOnly });
  return apiSuccess(result);
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const body = await request.json();
  const input = createAccountSchema.parse(body);

  const account = await createAccountForUser(auth.userId, input);
  return apiSuccess({ account }, { status: 201 });
});
