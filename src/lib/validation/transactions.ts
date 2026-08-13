import { z } from "zod";
import { positiveDecimalAmountSchema } from "./money";
import { isoDateSchema } from "./dates";

const positiveId = z.number().int().positive();
const description = z.string().trim().max(255).nullable().optional();
const notes = z.string().trim().max(2000).nullable().optional();

export const createIncomeSchema = z.object({
  type: z.literal("INCOME"),
  accountId: positiveId,
  categoryId: positiveId,
  amount: positiveDecimalAmountSchema,
  transactionDate: isoDateSchema,
  description,
  notes,
});

export const createExpenseSchema = z.object({
  type: z.literal("EXPENSE"),
  accountId: positiveId,
  categoryId: positiveId,
  amount: positiveDecimalAmountSchema,
  transactionDate: isoDateSchema,
  description,
  notes,
});

export const createTransferSchema = z
  .object({
    type: z.literal("TRANSFER"),
    fromAccountId: positiveId,
    toAccountId: positiveId,
    amount: positiveDecimalAmountSchema,
    transactionDate: isoDateSchema,
    description,
    notes,
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and destination accounts must be different",
    path: ["toAccountId"],
  });

export const createTransactionSchema = z.discriminatedUnion("type", [
  createIncomeSchema,
  createExpenseSchema,
  createTransferSchema,
]);

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// Transaction `type` is immutable after creation (see docs/02-financial-model.md).
// These are intentionally loose partial shapes — the service layer merges
// them with the existing row and re-validates the same invariants as create,
// since only it knows which fields actually changed.
export const updateIncomeOrExpenseSchema = z.object({
  accountId: positiveId.optional(),
  categoryId: positiveId.optional(),
  amount: positiveDecimalAmountSchema.optional(),
  transactionDate: isoDateSchema.optional(),
  description,
  notes,
});

export type UpdateIncomeOrExpenseInput = z.infer<typeof updateIncomeOrExpenseSchema>;

export const updateTransferSchema = z.object({
  fromAccountId: positiveId.optional(),
  toAccountId: positiveId.optional(),
  amount: positiveDecimalAmountSchema.optional(),
  transactionDate: isoDateSchema.optional(),
  description,
  notes,
});

export type UpdateTransferInput = z.infer<typeof updateTransferSchema>;

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE", "TRANSFER"] as const;

export const listTransactionsQuerySchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  accountId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  dateFrom: isoDateSchema.optional(),
  dateTo: isoDateSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
