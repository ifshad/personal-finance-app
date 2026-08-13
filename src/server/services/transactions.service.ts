import { ApiError } from "@/lib/api-error";
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateIncomeOrExpenseInput,
  UpdateTransferInput,
} from "@/lib/validation/transactions";
import {
  updateIncomeOrExpenseSchema,
  updateTransferSchema,
} from "@/lib/validation/transactions";
import { findAccountByIdForUser } from "@/server/repositories/accounts.repository";
import { findCategoryByIdForUser } from "@/server/repositories/categories.repository";
import {
  createTransaction,
  deleteTransactionForUser,
  findTransactionByIdForUser,
  findTransactionsByUser,
  updateTransactionForUser,
  type TransactionFilters,
} from "@/server/repositories/transactions.repository";
import type { AccountRow, CategoryRow, CategoryType, TransactionRow } from "@/types/db";

export type TransactionDto = {
  id: number;
  type: TransactionRow["type"];
  amount: string;
  accountId: number | null;
  categoryId: number | null;
  fromAccountId: number | null;
  toAccountId: number | null;
  transactionDate: string;
  description: string | null;
  notes: string | null;
};

function toTransactionDto(row: TransactionRow): TransactionDto {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    accountId: row.account_id,
    categoryId: row.category_id,
    fromAccountId: row.from_account_id,
    toAccountId: row.to_account_id,
    transactionDate: row.transaction_date,
    description: row.description,
    notes: row.notes,
  };
}

// --- Ownership + business-rule helpers -------------------------------------

/** Account must belong to the user. Active is only required for NEW selections. */
async function requireOwnedAccount(userId: number, accountId: number): Promise<AccountRow> {
  const account = await findAccountByIdForUser(accountId, userId);
  if (!account) {
    throw ApiError.validation("Account not found");
  }
  return account;
}

async function requireActiveAccount(userId: number, accountId: number): Promise<AccountRow> {
  const account = await requireOwnedAccount(userId, accountId);
  if (!account.is_active) {
    throw ApiError.validation(`Account "${account.name}" is inactive and can't be used for new entries`);
  }
  return account;
}

async function requireOwnedCategory(
  userId: number,
  categoryId: number,
  expectedType: CategoryType,
): Promise<CategoryRow> {
  const category = await findCategoryByIdForUser(categoryId, userId);
  if (!category) {
    throw ApiError.validation("Category not found");
  }
  if (category.type !== expectedType) {
    throw ApiError.validation(`Category must be of type ${expectedType}`);
  }
  return category;
}

async function requireActiveCategory(
  userId: number,
  categoryId: number,
  expectedType: CategoryType,
): Promise<CategoryRow> {
  const category = await requireOwnedCategory(userId, categoryId, expectedType);
  if (!category.is_active) {
    throw ApiError.validation(`Category "${category.name}" is inactive and can't be used for new entries`);
  }
  return category;
}

// --- Create ------------------------------------------------------------

export async function createTransactionForUser(
  userId: number,
  input: CreateTransactionInput,
): Promise<TransactionDto> {
  if (input.type === "TRANSFER") {
    await requireActiveAccount(userId, input.fromAccountId);
    await requireActiveAccount(userId, input.toAccountId);

    const row = await createTransaction({
      user_id: userId,
      type: "TRANSFER",
      amount: input.amount,
      account_id: null,
      category_id: null,
      from_account_id: input.fromAccountId,
      to_account_id: input.toAccountId,
      transaction_date: input.transactionDate,
      description: input.description ?? null,
      notes: input.notes ?? null,
    });
    return toTransactionDto(row);
  }

  // INCOME or EXPENSE
  await requireActiveAccount(userId, input.accountId);
  await requireActiveCategory(userId, input.categoryId, input.type);

  const row = await createTransaction({
    user_id: userId,
    type: input.type,
    amount: input.amount,
    account_id: input.accountId,
    category_id: input.categoryId,
    from_account_id: null,
    to_account_id: null,
    transaction_date: input.transactionDate,
    description: input.description ?? null,
    notes: input.notes ?? null,
  });
  return toTransactionDto(row);
}

// --- Update ------------------------------------------------------------

async function updateIncomeOrExpense(
  userId: number,
  existing: TransactionRow,
  input: UpdateIncomeOrExpenseInput,
): Promise<TransactionRow> {
  const nextAccountId = input.accountId ?? existing.account_id!;
  const nextCategoryId = input.categoryId ?? existing.category_id!;

  // Only re-check "active" when the user is actually changing to a
  // different account/category — keeping a historical (now inactive) one
  // untouched must never be blocked (docs/02-financial-model.md §7, §17).
  if (input.accountId !== undefined && input.accountId !== existing.account_id) {
    await requireActiveAccount(userId, nextAccountId);
  } else {
    await requireOwnedAccount(userId, nextAccountId);
  }

  if (input.categoryId !== undefined && input.categoryId !== existing.category_id) {
    await requireActiveCategory(userId, nextCategoryId, existing.type as CategoryType);
  } else {
    await requireOwnedCategory(userId, nextCategoryId, existing.type as CategoryType);
  }

  const updated = await updateTransactionForUser(existing.id, userId, {
    account_id: nextAccountId,
    category_id: nextCategoryId,
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.transactionDate !== undefined ? { transaction_date: input.transactionDate } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  });

  if (!updated) {
    throw ApiError.notFound("Transaction not found");
  }
  return updated;
}

async function updateTransfer(
  userId: number,
  existing: TransactionRow,
  input: UpdateTransferInput,
): Promise<TransactionRow> {
  const nextFrom = input.fromAccountId ?? existing.from_account_id!;
  const nextTo = input.toAccountId ?? existing.to_account_id!;

  if (nextFrom === nextTo) {
    throw ApiError.validation("Source and destination accounts must be different");
  }

  if (input.fromAccountId !== undefined && input.fromAccountId !== existing.from_account_id) {
    await requireActiveAccount(userId, nextFrom);
  } else {
    await requireOwnedAccount(userId, nextFrom);
  }

  if (input.toAccountId !== undefined && input.toAccountId !== existing.to_account_id) {
    await requireActiveAccount(userId, nextTo);
  } else {
    await requireOwnedAccount(userId, nextTo);
  }

  const updated = await updateTransactionForUser(existing.id, userId, {
    from_account_id: nextFrom,
    to_account_id: nextTo,
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.transactionDate !== undefined ? { transaction_date: input.transactionDate } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  });

  if (!updated) {
    throw ApiError.notFound("Transaction not found");
  }
  return updated;
}

/**
 * Updates a transaction. `type` is immutable, so this validates the raw
 * body against whichever shape matches the transaction's existing type —
 * only the service knows that type until after the ownership-checked fetch.
 */
export async function updateTransactionForCurrentUser(
  userId: number,
  transactionId: number,
  rawInput: unknown,
): Promise<TransactionDto> {
  const existing = await findTransactionByIdForUser(transactionId, userId);
  if (!existing) {
    throw ApiError.notFound("Transaction not found");
  }

  if (existing.type === "TRANSFER") {
    const input = updateTransferSchema.parse(rawInput);
    const updated = await updateTransfer(userId, existing, input);
    return toTransactionDto(updated);
  }

  const input = updateIncomeOrExpenseSchema.parse(rawInput);
  const updated = await updateIncomeOrExpense(userId, existing, input);
  return toTransactionDto(updated);
}

// --- Delete / read -------------------------------------------------------

export async function deleteTransactionForCurrentUser(
  userId: number,
  transactionId: number,
): Promise<void> {
  const deleted = await deleteTransactionForUser(transactionId, userId);
  if (!deleted) {
    throw ApiError.notFound("Transaction not found");
  }
}

export async function getTransactionForUser(
  userId: number,
  transactionId: number,
): Promise<TransactionDto> {
  const row = await findTransactionByIdForUser(transactionId, userId);
  if (!row) {
    throw ApiError.notFound("Transaction not found");
  }
  return toTransactionDto(row);
}

export async function listTransactionsForUser(
  userId: number,
  query: ListTransactionsQuery,
): Promise<{ transactions: TransactionDto[]; page: number; pageSize: number; total: number }> {
  const filters: TransactionFilters = {
    type: query.type,
    accountId: query.accountId,
    categoryId: query.categoryId,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
  };

  const { rows, total } = await findTransactionsByUser(userId, filters, {
    page: query.page,
    pageSize: query.pageSize,
  });

  return {
    transactions: rows.map(toTransactionDto),
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}
