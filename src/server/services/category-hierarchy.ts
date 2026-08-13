import type { CategoryRow } from "@/types/db";

/**
 * IDs of a category plus its direct children — hierarchy is capped at two
 * levels (see categories.service.ts), so this never needs to recurse.
 *
 * A parent category's "actual spent" (budgets, reports) rolls up its
 * subcategories' transactions, since real expenses are usually logged
 * against the specific subcategory (e.g. "Rent") rather than the group
 * ("Housing") itself.
 */
export function categoryIdsWithDescendants(
  categories: CategoryRow[],
  categoryId: number,
): number[] {
  const childIds = categories
    .filter((category) => category.parent_id === categoryId)
    .map((category) => category.id);
  return [categoryId, ...childIds];
}
