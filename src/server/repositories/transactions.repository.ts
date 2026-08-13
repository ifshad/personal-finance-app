import type { Knex } from "knex";
import { db } from "@/server/db/client";
import type { TransactionRow, TransactionType } from "@/types/db";

const TABLE = "transactions";

export type NewTransaction = {
  user_id: number;
  type: TransactionType;
  amount: string;
  account_id: number | null;
  category_id: number | null;
  from_account_id: number | null;
  to_account_id: number | null;
  transaction_date: string;
  description: string | null;
  notes: string | null;
};

export type TransactionUpdate = Partial<
  Pick<
    TransactionRow,
    | "amount"
    | "account_id"
    | "category_id"
    | "from_account_id"
    | "to_account_id"
    | "transaction_date"
    | "description"
    | "notes"
  >
>;

export type TransactionFilters = {
  type?: TransactionType;
  accountId?: number;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
};

function applyFilters(
  query: Knex.QueryBuilder<TransactionRow, TransactionRow[]>,
  userId: number,
  filters: TransactionFilters,
) {
  query.where({ user_id: userId });

  if (filters.type) {
    query.andWhere({ type: filters.type });
  }
  if (filters.accountId) {
    query.andWhere((qb) => {
      qb.where({ account_id: filters.accountId })
        .orWhere({ from_account_id: filters.accountId })
        .orWhere({ to_account_id: filters.accountId });
    });
  }
  if (filters.categoryId) {
    query.andWhere({ category_id: filters.categoryId });
  }
  if (filters.dateFrom) {
    query.andWhere("transaction_date", ">=", filters.dateFrom);
  }
  if (filters.dateTo) {
    query.andWhere("transaction_date", "<=", filters.dateTo);
  }
  return query;
}

export async function findTransactionsByUser(
  userId: number,
  filters: TransactionFilters,
  pagination: { page: number; pageSize: number },
): Promise<{ rows: TransactionRow[]; total: number }> {
  const baseQuery = () => applyFilters(db<TransactionRow>(TABLE), userId, filters);

  const [rows, countResult] = await Promise.all([
    baseQuery()
      .orderBy("transaction_date", "desc")
      .orderBy("id", "desc")
      .limit(pagination.pageSize)
      .offset((pagination.page - 1) * pagination.pageSize),
    baseQuery().count<{ count: string }[]>({ count: "*" }),
  ]);

  return { rows, total: Number(countResult[0]?.count ?? 0) };
}

export function findTransactionByIdForUser(
  id: number,
  userId: number,
): Promise<TransactionRow | undefined> {
  return db<TransactionRow>(TABLE).where({ id, user_id: userId }).first();
}

export async function createTransaction(input: NewTransaction): Promise<TransactionRow> {
  const [id] = await db<TransactionRow>(TABLE).insert(input);
  const transaction = await db<TransactionRow>(TABLE).where({ id }).first();
  if (!transaction) {
    throw new Error("Failed to load transaction immediately after creation");
  }
  return transaction;
}

export async function updateTransactionForUser(
  id: number,
  userId: number,
  update: TransactionUpdate,
): Promise<TransactionRow | undefined> {
  await db<TransactionRow>(TABLE).where({ id, user_id: userId }).update(update);
  return findTransactionByIdForUser(id, userId);
}

export async function deleteTransactionForUser(id: number, userId: number): Promise<boolean> {
  const deleted = await db<TransactionRow>(TABLE).where({ id, user_id: userId }).delete();
  return deleted > 0;
}
