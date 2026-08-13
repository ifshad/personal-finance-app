import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { requireUser } from "@/server/auth/session";
import { createTransactionSchema, listTransactionsQuerySchema } from "@/lib/validation/transactions";
import {
  createTransactionForUser,
  listTransactionsForUser,
} from "@/server/services/transactions.service";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const query = listTransactionsQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  const result = await listTransactionsForUser(auth.userId, query);
  return apiSuccess(result);
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const body = await request.json();
  const input = createTransactionSchema.parse(body);

  const transaction = await createTransactionForUser(auth.userId, input);
  return apiSuccess({ transaction }, { status: 201 });
});
