import { getCurrentMonthRange, getLocalDateString, remainingDaysInRange } from "@/lib/period";
import { findAccountsByUser } from "@/server/repositories/accounts.repository";
import { getAccountBalances, getTotalBalance } from "./balances.service";
import { findBudgetForPeriod } from "./budgets.service";
import { Money } from "./money";

export type SafeToSpendResult =
  | {
      available: true;
      amountPerDay: string;
      basis: "balance_and_budget" | "balance_only";
      remainingDays: number;
    }
  | { available: false; reason: string };

/**
 * Pure calculation — the exact formula lives here ONLY, per
 * docs/02-financial-model.md §14, so the dashboard never has to duplicate
 * (and potentially drift from) this logic.
 *
 * Safe-to-spend/day = (total balance - money still committed to planned
 * budget categories this period) / days remaining in the period, floored
 * at zero.
 */
export function calculateSafeToSpend(params: {
  totalBalance: Money;
  remainingCommitted: Money;
  remainingDays: number;
  hasBudget: boolean;
}): SafeToSpendResult {
  if (params.remainingDays <= 0) {
    return { available: false, reason: "No days remaining in this period" };
  }

  const spendable = params.totalBalance.subtract(params.remainingCommitted);
  const flooredSpendable = spendable.isNegative() ? 0 : spendable.toNumber();
  const amountPerDay = (flooredSpendable / params.remainingDays).toFixed(2);

  return {
    available: true,
    amountPerDay,
    basis: params.hasBudget ? "balance_and_budget" : "balance_only",
    remainingDays: params.remainingDays,
  };
}

export async function getSafeToSpendForUser(
  userId: number,
  timezone: string,
): Promise<SafeToSpendResult> {
  const accounts = await findAccountsByUser(userId);
  if (accounts.length === 0) {
    return { available: false, reason: "Add an account to see this estimate" };
  }

  const localDate = getLocalDateString(timezone);
  const monthRange = getCurrentMonthRange(localDate);

  const balances = await getAccountBalances(userId, accounts);
  const totalBalance = getTotalBalance(accounts, balances);

  const budget = await findBudgetForPeriod(userId, monthRange.start, monthRange.end);
  let remainingCommitted = Money.zero();
  if (budget) {
    for (const item of budget.items) {
      const remaining = Money.fromDecimalString(item.plannedAmount).subtract(
        Money.fromDecimalString(item.actualAmount),
      );
      if (remaining.isPositive()) {
        remainingCommitted = remainingCommitted.add(remaining);
      }
    }
  }

  const remainingDays = remainingDaysInRange(monthRange, localDate);
  return calculateSafeToSpend({
    totalBalance,
    remainingCommitted,
    remainingDays,
    hasBudget: Boolean(budget),
  });
}
