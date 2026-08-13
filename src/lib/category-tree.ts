import type { CategoryDto } from "@/server/services/categories.service";
import type { CategoryType } from "@/types/db";

export type CategoryGroup = {
  parent: CategoryDto;
  children: CategoryDto[];
};

/** Groups a flat category list into parent + children, for one type at a time. */
export function groupCategoriesByParent(
  categories: CategoryDto[],
  type: CategoryType,
): CategoryGroup[] {
  const topLevel = categories.filter((c) => c.type === type && c.parentId === null);
  return topLevel.map((parent) => ({
    parent,
    children: categories.filter((c) => c.parentId === parent.id),
  }));
}
