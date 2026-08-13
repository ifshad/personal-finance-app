import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { parseIdParam } from "@/lib/parse-id-param";
import { requireUser } from "@/server/auth/session";
import { updateCategorySchema } from "@/lib/validation/categories";
import { updateCategoryForCurrentUser } from "@/server/services/categories.service";

type RouteParams = { params: Promise<{ id: string }> };

export const PATCH = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const categoryId = parseIdParam((await params).id);
  const body = await request.json();
  const input = updateCategorySchema.parse(body);

  const category = await updateCategoryForCurrentUser(auth.userId, categoryId, input);
  return apiSuccess({ category });
});
