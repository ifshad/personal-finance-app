import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { requireUser } from "@/server/auth/session";
import { createCategorySchema } from "@/lib/validation/categories";
import type { CategoryType } from "@/types/db";
import { createCategoryForUser, listCategories } from "@/server/services/categories.service";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const { searchParams } = request.nextUrl;
  const activeOnly = searchParams.get("activeOnly") === "true";
  const typeParam = searchParams.get("type");
  const type =
    typeParam === "INCOME" || typeParam === "EXPENSE" ? (typeParam as CategoryType) : undefined;

  const categories = await listCategories(auth.userId, { activeOnly, type });
  return apiSuccess({ categories });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const body = await request.json();
  const input = createCategorySchema.parse(body);

  const category = await createCategoryForUser(auth.userId, input);
  return apiSuccess({ category }, { status: 201 });
});
