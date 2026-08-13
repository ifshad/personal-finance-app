import { findCategoriesByUser } from "@/server/repositories/categories.repository";
import { sumTransactionsByCategory } from "@/server/repositories/transactions.repository";
import type { CategoryType } from "@/types/db";
import { categoryIdsWithDescendants } from "./category-hierarchy";
import { Money } from "./money";

export type CategoryBreakdownItem = {
  categoryId: number;
  categoryName: string;
  total: string;
};

/**
 * Expense/income totals per TOP-LEVEL category for a date range, rolled up
 * to include each category's subcategories (see category-hierarchy.ts).
 * Shared by the dashboard and reports so the two never compute this
 * differently.
 */
export async function getCategoryBreakdown(
  userId: number,
  type: CategoryType,
  dateFrom: string,
  dateTo: string,
): Promise<CategoryBreakdownItem[]> {
  const [categories, sums] = await Promise.all([
    findCategoriesByUser(userId, { type }),
    sumTransactionsByCategory(userId, { type, dateFrom, dateTo }),
  ]);

  const sumByCategoryId = new Map(
    sums.map((row) => [row.categoryId, Money.fromDecimalString(row.total)]),
  );
  const topLevel = categories.filter((category) => category.parent_id === null);

  const results = topLevel.map((parent) => {
    const ids = categoryIdsWithDescendants(categories, parent.id);
    const total = ids.reduce(
      (sum, id) => sum.add(sumByCategoryId.get(id) ?? Money.zero()),
      Money.zero(),
    );
    return { categoryId: parent.id, categoryName: parent.name, total: total.toDecimalString() };
  });

  return results
    .filter((item) => Money.fromDecimalString(item.total).isPositive())
    .sort((a, b) => Money.fromDecimalString(b.total).compare(Money.fromDecimalString(a.total)));
}
