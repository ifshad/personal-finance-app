import { ApiError } from "@/lib/api-error";
import type { CreateBudgetInput, CreateBudgetItemInput } from "@/lib/validation/budgets";
import {
  createBudgetItem,
  deleteBudgetItemForBudget,
  findItemByCategoryForBudget,
  findItemByIdForBudget,
  findItemsByBudget,
  updateBudgetItemForBudget,
} from "@/server/repositories/budget-items.repository";
import {
  createBudget,
  findBudgetByIdForUser,
  findBudgetByPeriodForUser,
  findBudgetsByUser,
} from "@/server/repositories/budgets.repository";
import { findCategoriesByUser } from "@/server/repositories/categories.repository";
import { sumTransactionAmount } from "@/server/repositories/transactions.repository";
import type { BudgetItemRow, BudgetRow, CategoryRow } from "@/types/db";
import { categoryIdsWithDescendants } from "./category-hierarchy";
import { Money } from "./money";

export type BudgetItemDto = {
  id: number;
  categoryId: number;
  categoryName: string;
  plannedAmount: string;
  actualAmount: string;
  variance: string;
  percentageUsed: number | null;
  isOverBudget: boolean;
};

export type BudgetDto = {
  id: number;
  name: string | null;
  periodStart: string;
  periodEnd: string;
  totalPlanned: string;
  totalActual: string;
  totalVariance: string;
  percentageUsed: number | null;
  items: BudgetItemDto[];
};

function percentageOf(actual: Money, planned: Money): number | null {
  if (planned.isZero()) return null;
  return Math.round((actual.toNumber() / planned.toNumber()) * 1000) / 10; // one decimal place
}

async function toBudgetItemDto(
  userId: number,
  budget: BudgetRow,
  item: BudgetItemRow,
  categories: CategoryRow[],
): Promise<BudgetItemDto> {
  const category = categories.find((c) => c.id === item.category_id);
  const categoryIds = categoryIdsWithDescendants(categories, item.category_id);

  const actualStr = await sumTransactionAmount(userId, {
    type: "EXPENSE",
    categoryIds,
    dateFrom: budget.period_start,
    dateTo: budget.period_end,
  });

  const planned = Money.fromDecimalString(item.planned_amount);
  const actual = Money.fromDecimalString(actualStr);
  const variance = planned.subtract(actual);

  return {
    id: item.id,
    categoryId: item.category_id,
    categoryName: category?.name ?? "Unknown category",
    plannedAmount: planned.toDecimalString(),
    actualAmount: actual.toDecimalString(),
    variance: variance.toDecimalString(),
    percentageUsed: percentageOf(actual, planned),
    isOverBudget: variance.isNegative(),
  };
}

async function toBudgetDto(
  userId: number,
  budget: BudgetRow,
  categories: CategoryRow[],
): Promise<BudgetDto> {
  const itemRows = await findItemsByBudget(budget.id);
  const items = await Promise.all(
    itemRows.map((item) => toBudgetItemDto(userId, budget, item, categories)),
  );

  const totalPlanned = items.reduce(
    (sum, item) => sum.add(Money.fromDecimalString(item.plannedAmount)),
    Money.zero(),
  );
  const totalActual = items.reduce(
    (sum, item) => sum.add(Money.fromDecimalString(item.actualAmount)),
    Money.zero(),
  );
  const totalVariance = totalPlanned.subtract(totalActual);

  return {
    id: budget.id,
    name: budget.name,
    periodStart: budget.period_start,
    periodEnd: budget.period_end,
    totalPlanned: totalPlanned.toDecimalString(),
    totalActual: totalActual.toDecimalString(),
    totalVariance: totalVariance.toDecimalString(),
    percentageUsed: percentageOf(totalActual, totalPlanned),
    items,
  };
}

export async function listBudgetsForUser(userId: number): Promise<BudgetDto[]> {
  const [budgets, categories] = await Promise.all([
    findBudgetsByUser(userId),
    findCategoriesByUser(userId),
  ]);
  return Promise.all(budgets.map((budget) => toBudgetDto(userId, budget, categories)));
}

export async function getBudgetDetailForUser(
  userId: number,
  budgetId: number,
): Promise<BudgetDto> {
  const budget = await findBudgetByIdForUser(budgetId, userId);
  if (!budget) {
    throw ApiError.notFound("Budget not found");
  }
  const categories = await findCategoriesByUser(userId);
  return toBudgetDto(userId, budget, categories);
}

/** Used by the dashboard/reports to find the budget for an exact period, if any. */
export async function findBudgetForPeriod(
  userId: number,
  periodStart: string,
  periodEnd: string,
): Promise<BudgetDto | null> {
  const budget = await findBudgetByPeriodForUser(userId, periodStart, periodEnd);
  if (!budget) return null;
  const categories = await findCategoriesByUser(userId);
  return toBudgetDto(userId, budget, categories);
}

export async function createBudgetForUser(
  userId: number,
  input: CreateBudgetInput,
): Promise<BudgetDto> {
  const existing = await findBudgetByPeriodForUser(userId, input.periodStart, input.periodEnd);
  if (existing) {
    throw ApiError.conflict("A budget already exists for this exact period");
  }

  const budget = await createBudget({
    user_id: userId,
    name: input.name ?? null,
    period_start: input.periodStart,
    period_end: input.periodEnd,
  });

  return toBudgetDto(userId, budget, await findCategoriesByUser(userId));
}

async function requireOwnedBudget(userId: number, budgetId: number): Promise<BudgetRow> {
  const budget = await findBudgetByIdForUser(budgetId, userId);
  if (!budget) {
    throw ApiError.notFound("Budget not found");
  }
  return budget;
}

export async function addBudgetItemForUser(
  userId: number,
  budgetId: number,
  input: CreateBudgetItemInput,
): Promise<BudgetItemDto> {
  const budget = await requireOwnedBudget(userId, budgetId);
  const categories = await findCategoriesByUser(userId);

  const category = categories.find((c) => c.id === input.categoryId);
  if (!category) {
    throw ApiError.validation("Category not found");
  }
  if (category.type !== "EXPENSE") {
    throw ApiError.validation("Budget items must use an expense category");
  }

  const duplicate = await findItemByCategoryForBudget(budgetId, input.categoryId);
  if (duplicate) {
    throw ApiError.conflict(`"${category.name}" is already in this budget`);
  }

  // A parent category's actual amount rolls up its children's transactions
  // (see category-hierarchy.ts). Budgeting a parent AND one of its children
  // in the same budget would double-count that child's spending in the
  // budget's totals, so the two are mutually exclusive.
  const existingItems = await findItemsByBudget(budgetId);
  const existingCategoryIds = new Set(existingItems.map((item) => item.category_id));

  if (category.parent_id !== null && existingCategoryIds.has(category.parent_id)) {
    const parentCategory = categories.find((c) => c.id === category.parent_id);
    throw ApiError.conflict(
      `"${parentCategory?.name ?? "Its parent category"}" is already budgeted, which includes "${category.name}"`,
    );
  }
  if (category.parent_id === null) {
    const childIds = categories.filter((c) => c.parent_id === category.id).map((c) => c.id);
    const conflictingChildId = childIds.find((id) => existingCategoryIds.has(id));
    if (conflictingChildId) {
      const childCategory = categories.find((c) => c.id === conflictingChildId);
      throw ApiError.conflict(
        `"${childCategory?.name ?? "A subcategory"}" is already budgeted separately — remove it first to budget "${category.name}" as a whole`,
      );
    }
  }

  const item = await createBudgetItem({
    budget_id: budgetId,
    category_id: input.categoryId,
    planned_amount: input.plannedAmount,
  });

  return toBudgetItemDto(userId, budget, item, categories);
}

export async function updateBudgetItemForUser(
  userId: number,
  budgetId: number,
  itemId: number,
  plannedAmount: string,
): Promise<BudgetItemDto> {
  const budget = await requireOwnedBudget(userId, budgetId);

  const existing = await findItemByIdForBudget(itemId, budgetId);
  if (!existing) {
    throw ApiError.notFound("Budget item not found");
  }

  const updated = await updateBudgetItemForBudget(itemId, budgetId, plannedAmount);
  if (!updated) {
    throw ApiError.notFound("Budget item not found");
  }

  const categories = await findCategoriesByUser(userId);
  return toBudgetItemDto(userId, budget, updated, categories);
}

export async function deleteBudgetItemForUser(
  userId: number,
  budgetId: number,
  itemId: number,
): Promise<void> {
  await requireOwnedBudget(userId, budgetId);
  const deleted = await deleteBudgetItemForBudget(itemId, budgetId);
  if (!deleted) {
    throw ApiError.notFound("Budget item not found");
  }
}
