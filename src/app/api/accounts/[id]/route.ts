import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { parseIdParam } from "@/lib/parse-id-param";
import { requireUser } from "@/server/auth/session";
import { updateAccountSchema } from "@/lib/validation/accounts";
import { getAccountForUser, updateAccountForCurrentUser } from "@/server/services/accounts.service";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const accountId = parseIdParam((await params).id);

  const account = await getAccountForUser(auth.userId, accountId);
  return apiSuccess({ account });
});

export const PATCH = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const accountId = parseIdParam((await params).id);
  const body = await request.json();
  const input = updateAccountSchema.parse(body);

  const account = await updateAccountForCurrentUser(auth.userId, accountId, input);
  return apiSuccess({ account });
});
