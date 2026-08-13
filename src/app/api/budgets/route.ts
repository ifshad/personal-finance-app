import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { requireUser } from "@/server/auth/session";
import { createBudgetSchema } from "@/lib/validation/budgets";
import { createBudgetForUser, listBudgetsForUser } from "@/server/services/budgets.service";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const budgets = await listBudgetsForUser(auth.userId);
  return apiSuccess({ budgets });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const body = await request.json();
  const input = createBudgetSchema.parse(body);

  const budget = await createBudgetForUser(auth.userId, input);
  return apiSuccess({ budget }, { status: 201 });
});
