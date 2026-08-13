import { db } from "@/server/db/client";
import type { AccountRow, AccountType } from "@/types/db";

const TABLE = "accounts";

export type NewAccount = {
  user_id: number;
  name: string;
  account_type: AccountType;
  opening_balance: string;
};

export type AccountUpdate = Partial<
  Pick<AccountRow, "name" | "account_type" | "opening_balance" | "is_active">
>;

/** Every query here is scoped to `user_id` — never look up an account by id alone. */

export function findAccountsByUser(
  userId: number,
  options?: { activeOnly?: boolean },
): Promise<AccountRow[]> {
  const query = db<AccountRow>(TABLE).where({ user_id: userId });
  if (options?.activeOnly) {
    query.andWhere({ is_active: true });
  }
  return query.orderBy("created_at", "asc");
}

export function findAccountByIdForUser(
  id: number,
  userId: number,
): Promise<AccountRow | undefined> {
  return db<AccountRow>(TABLE).where({ id, user_id: userId }).first();
}

export async function createAccount(input: NewAccount): Promise<AccountRow> {
  const [id] = await db<AccountRow>(TABLE).insert(input);
  const account = await db<AccountRow>(TABLE).where({ id }).first();
  if (!account) {
    throw new Error("Failed to load account immediately after creation");
  }
  return account;
}

export async function updateAccountForUser(
  id: number,
  userId: number,
  update: AccountUpdate,
): Promise<AccountRow | undefined> {
  await db<AccountRow>(TABLE).where({ id, user_id: userId }).update(update);
  return findAccountByIdForUser(id, userId);
}
