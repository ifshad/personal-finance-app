import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { parseIdParam } from "@/lib/parse-id-param";
import { requireUser } from "@/server/auth/session";
import {
  deleteTransactionForCurrentUser,
  getTransactionForUser,
  updateTransactionForCurrentUser,
} from "@/server/services/transactions.service";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const transactionId = parseIdParam((await params).id);

  const transaction = await getTransactionForUser(auth.userId, transactionId);
  return apiSuccess({ transaction });
});

export const PATCH = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const transactionId = parseIdParam((await params).id);
  const body = await request.json();

  const transaction = await updateTransactionForCurrentUser(auth.userId, transactionId, body);
  return apiSuccess({ transaction });
});

export const DELETE = withApiErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireUser(request);
  const transactionId = parseIdParam((await params).id);

  await deleteTransactionForCurrentUser(auth.userId, transactionId);
  return apiSuccess({ deleted: true });
});
