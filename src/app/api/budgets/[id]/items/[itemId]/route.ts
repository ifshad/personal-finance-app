import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { parseIdParam } from "@/lib/parse-id-param";
import { requireUser } from "@/server/auth/session";
import { updateBudgetItemSchema } from "@/lib/validation/budgets";
import {
  deleteBudgetItemForUser,
  updateBudgetItemForUser,
} from "@/server/services/budgets.service";

type RouteParams = { params: Promise<{ id: string; itemId: string }> };

export const PATCH = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const { id, itemId } = await params;
  const budgetId = parseIdParam(id);
  const parsedItemId = parseIdParam(itemId);
  const body = await request.json();
  const input = updateBudgetItemSchema.parse(body);

  const item = await updateBudgetItemForUser(auth.userId, budgetId, parsedItemId, input.plannedAmount);
  return apiSuccess({ item });
});

export const DELETE = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const { id, itemId } = await params;
  const budgetId = parseIdParam(id);
  const parsedItemId = parseIdParam(itemId);

  await deleteBudgetItemForUser(auth.userId, budgetId, parsedItemId);
  return apiSuccess({ deleted: true });
});
