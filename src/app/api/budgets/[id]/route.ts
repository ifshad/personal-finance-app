import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { parseIdParam } from "@/lib/parse-id-param";
import { requireUser } from "@/server/auth/session";
import { getBudgetDetailForUser } from "@/server/services/budgets.service";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const budgetId = parseIdParam((await params).id);

  const budget = await getBudgetDetailForUser(auth.userId, budgetId);
  return apiSuccess({ budget });
});
