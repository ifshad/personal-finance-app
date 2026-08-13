import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { parseIdParam } from "@/lib/parse-id-param";
import { requireUser } from "@/server/auth/session";
import { createBudgetItemSchema } from "@/lib/validation/budgets";
import { addBudgetItemForUser } from "@/server/services/budgets.service";

type RouteParams = { params: Promise<{ id: string }> };

export const POST = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const budgetId = parseIdParam((await params).id);
  const body = await request.json();
  const input = createBudgetItemSchema.parse(body);

  const item = await addBudgetItemForUser(auth.userId, budgetId, input);
  return apiSuccess({ item }, { status: 201 });
});
