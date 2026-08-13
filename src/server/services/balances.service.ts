import { db } from "@/server/db/client";
import { Money, sumMoney } from "./money";
import type { AccountRow } from "@/types/db";

type AmountTotalRow = { key: number; total: string };

async function sumAmountByGroup(
  userId: number,
  groupColumn: string,
  extraWhere: Record<string, string>,
): Promise<Map<number, Money>> {
  const rows = await db("transactions")
    .where({ user_id: userId, ...extraWhere })
    .whereNotNull(groupColumn)
    .groupBy(groupColumn)
    .select(db.raw("?? as `key`, SUM(amount) as total", [groupColumn]))
    .then((result) => result as unknown as AmountTotalRow[]);

  const map = new Map<number, Money>();
  for (const row of rows) {
    map.set(Number(row.key), Money.fromDecimalString(row.total));
  }
  return map;
}

/**
 * Current balance for every one of a user's accounts, computed from the
 * opening balance plus all relevant transactions:
 *
 *   balance = opening_balance + income - expense - transfers_out + transfers_in
 *
 * This is THE reusable source of account balances — the accounts list,
 * dashboard, and reports must all call this instead of recomputing balance
 * logic independently.
 */
export async function getAccountBalances(
  userId: number,
  accounts: AccountRow[],
): Promise<Map<number, Money>> {
  const [income, expense, transfersOut, transfersIn] = await Promise.all([
    sumAmountByGroup(userId, "account_id", { type: "INCOME" }),
    sumAmountByGroup(userId, "account_id", { type: "EXPENSE" }),
    sumAmountByGroup(userId, "from_account_id", { type: "TRANSFER" }),
    sumAmountByGroup(userId, "to_account_id", { type: "TRANSFER" }),
  ]);

  const balances = new Map<number, Money>();
  for (const account of accounts) {
    const zero = Money.zero();
    const balance = Money.fromDecimalString(account.opening_balance)
      .add(income.get(account.id) ?? zero)
      .subtract(expense.get(account.id) ?? zero)
      .subtract(transfersOut.get(account.id) ?? zero)
      .add(transfersIn.get(account.id) ?? zero);
    balances.set(account.id, balance);
  }
  return balances;
}

export async function getAccountBalance(
  userId: number,
  account: AccountRow,
): Promise<Money> {
  const balances = await getAccountBalances(userId, [account]);
  return balances.get(account.id) ?? Money.zero();
}

/** Sum of current balances across a user's ACTIVE accounts only (docs §11). */
export function getTotalBalance(
  accounts: AccountRow[],
  balances: Map<number, Money>,
): Money {
  const activeBalances = accounts
    .filter((account) => account.is_active)
    .map((account) => balances.get(account.id) ?? Money.zero());
  return sumMoney(activeBalances);
}
