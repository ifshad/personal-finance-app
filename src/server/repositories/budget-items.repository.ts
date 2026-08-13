import { db } from "@/server/db/client";
import type { BudgetItemRow } from "@/types/db";

const TABLE = "budget_items";

export type NewBudgetItem = {
  budget_id: number;
  category_id: number;
  planned_amount: string;
};

/**
 * All queries here are scoped by `budget_id`, never bare `id`. The service
 * layer must verify the budget belongs to the authenticated user first —
 * that's the actual ownership boundary, since budget_items have no
 * `user_id` of their own.
 */

export function findItemsByBudget(budgetId: number): Promise<BudgetItemRow[]> {
  return db<BudgetItemRow>(TABLE).where({ budget_id: budgetId });
}

export function findItemByIdForBudget(
  itemId: number,
  budgetId: number,
): Promise<BudgetItemRow | undefined> {
  return db<BudgetItemRow>(TABLE).where({ id: itemId, budget_id: budgetId }).first();
}

export function findItemByCategoryForBudget(
  budgetId: number,
  categoryId: number,
): Promise<BudgetItemRow | undefined> {
  return db<BudgetItemRow>(TABLE).where({ budget_id: budgetId, category_id: categoryId }).first();
}

export async function createBudgetItem(input: NewBudgetItem): Promise<BudgetItemRow> {
  const [id] = await db<BudgetItemRow>(TABLE).insert(input);
  const item = await db<BudgetItemRow>(TABLE).where({ id }).first();
  if (!item) {
    throw new Error("Failed to load budget item immediately after creation");
  }
  return item;
}

export async function updateBudgetItemForBudget(
  itemId: number,
  budgetId: number,
  plannedAmount: string,
): Promise<BudgetItemRow | undefined> {
  await db<BudgetItemRow>(TABLE)
    .where({ id: itemId, budget_id: budgetId })
    .update({ planned_amount: plannedAmount });
  return findItemByIdForBudget(itemId, budgetId);
}

export async function deleteBudgetItemForBudget(
  itemId: number,
  budgetId: number,
): Promise<boolean> {
  const deleted = await db<BudgetItemRow>(TABLE)
    .where({ id: itemId, budget_id: budgetId })
    .delete();
  return deleted > 0;
}
