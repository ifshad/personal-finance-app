import { ApiError } from "@/lib/api-error";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validation/categories";
import {
  createCategory,
  findCategoriesByUser,
  findCategoryByIdForUser,
  findCategoryByNameForUser,
  updateCategoryForUser,
} from "@/server/repositories/categories.repository";
import type { CategoryRow, CategoryType } from "@/types/db";

export type CategoryDto = {
  id: number;
  parentId: number | null;
  name: string;
  type: CategoryType;
  icon: string | null;
  isActive: boolean;
};

function toCategoryDto(row: CategoryRow): CategoryDto {
  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    type: row.type,
    icon: row.icon,
    isActive: row.is_active,
  };
}

export async function listCategories(
  userId: number,
  filters?: { activeOnly?: boolean; type?: CategoryType },
): Promise<CategoryDto[]> {
  const rows = await findCategoriesByUser(userId, filters);
  return rows.map(toCategoryDto);
}

export async function createCategoryForUser(
  userId: number,
  input: CreateCategoryInput,
): Promise<CategoryDto> {
  let parent: CategoryRow | undefined;

  if (input.parentId) {
    parent = await findCategoryByIdForUser(input.parentId, userId);
    if (!parent) {
      throw ApiError.validation("Parent category not found");
    }
    if (parent.parent_id !== null) {
      throw ApiError.validation("A subcategory cannot itself have a parent");
    }
    if (parent.type !== input.type) {
      throw ApiError.validation("A subcategory must have the same type as its parent");
    }
  }

  const parentId = input.parentId ?? null;
  const duplicate = await findCategoryByNameForUser(userId, parentId, input.type, input.name);
  if (duplicate) {
    throw ApiError.conflict(
      parent
        ? `"${input.name}" already exists under "${parent.name}"`
        : `"${input.name}" already exists`,
    );
  }

  const created = await createCategory({
    user_id: userId,
    parent_id: parentId,
    name: input.name,
    type: input.type,
    icon: input.icon ?? null,
  });
  return toCategoryDto(created);
}

export async function updateCategoryForCurrentUser(
  userId: number,
  categoryId: number,
  input: UpdateCategoryInput,
): Promise<CategoryDto> {
  const existing = await findCategoryByIdForUser(categoryId, userId);
  if (!existing) {
    throw ApiError.notFound("Category not found");
  }

  if (input.name && input.name !== existing.name) {
    const duplicate = await findCategoryByNameForUser(
      userId,
      existing.parent_id,
      existing.type,
      input.name,
    );
    if (duplicate && duplicate.id !== categoryId) {
      throw ApiError.conflict(`"${input.name}" already exists in this group`);
    }
  }

  const updated = await updateCategoryForUser(categoryId, userId, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.icon !== undefined ? { icon: input.icon } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
  });

  if (!updated) {
    throw ApiError.notFound("Category not found");
  }
  return toCategoryDto(updated);
}
