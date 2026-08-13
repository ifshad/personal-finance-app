import { db } from "@/server/db/client";
import type { BudgetRow } from "@/types/db";

const TABLE = "budgets";

export type NewBudget = {
  user_id: number;
  name: string | null;
  period_start: string;
  period_end: string;
};

export function findBudgetsByUser(userId: number): Promise<BudgetRow[]> {
  return db<BudgetRow>(TABLE).where({ user_id: userId }).orderBy("period_start", "desc");
}

export function findBudgetByIdForUser(
  id: number,
  userId: number,
): Promise<BudgetRow | undefined> {
  return db<BudgetRow>(TABLE).where({ id, user_id: userId }).first();
}

export function findBudgetByPeriodForUser(
  userId: number,
  periodStart: string,
  periodEnd: string,
): Promise<BudgetRow | undefined> {
  return db<BudgetRow>(TABLE)
    .where({ user_id: userId, period_start: periodStart, period_end: periodEnd })
    .first();
}

export async function createBudget(input: NewBudget): Promise<BudgetRow> {
  const [id] = await db<BudgetRow>(TABLE).insert(input);
  const budget = await db<BudgetRow>(TABLE).where({ id }).first();
  if (!budget) {
    throw new Error("Failed to load budget immediately after creation");
  }
  return budget;
}
