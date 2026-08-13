import type { Knex } from "knex";
import { db } from "@/server/db/client";
import type { CategoryRow, CategoryType } from "@/types/db";

const TABLE = "categories";

export type NewCategory = {
  user_id: number;
  parent_id: number | null;
  name: string;
  type: CategoryType;
  icon: string | null;
};

export type CategoryUpdate = Partial<
  Pick<CategoryRow, "name" | "icon" | "is_active">
>;

export function findCategoriesByUser(
  userId: number,
  options?: { activeOnly?: boolean; type?: CategoryType },
): Promise<CategoryRow[]> {
  const query = db<CategoryRow>(TABLE).where({ user_id: userId });
  if (options?.activeOnly) {
    query.andWhere({ is_active: true });
  }
  if (options?.type) {
    query.andWhere({ type: options.type });
  }
  return query.orderBy("name", "asc");
}

export function findCategoryByIdForUser(
  id: number,
  userId: number,
): Promise<CategoryRow | undefined> {
  return db<CategoryRow>(TABLE).where({ id, user_id: userId }).first();
}

export function findCategoryByNameForUser(
  userId: number,
  parentId: number | null,
  type: CategoryType,
  name: string,
): Promise<CategoryRow | undefined> {
  return db<CategoryRow>(TABLE)
    .where({ user_id: userId, parent_id: parentId, type, name })
    .first();
}

export async function createCategory(
  input: NewCategory,
  conn: Knex = db,
): Promise<CategoryRow> {
  const [id] = await conn<CategoryRow>(TABLE).insert(input);
  const category = await conn<CategoryRow>(TABLE).where({ id }).first();
  if (!category) {
    throw new Error("Failed to load category immediately after creation");
  }
  return category;
}

export async function updateCategoryForUser(
  id: number,
  userId: number,
  update: CategoryUpdate,
): Promise<CategoryRow | undefined> {
  await db<CategoryRow>(TABLE).where({ id, user_id: userId }).update(update);
  return findCategoryByIdForUser(id, userId);
}

export function countChildCategories(parentId: number): Promise<number> {
  return db<CategoryRow>(TABLE)
    .where({ parent_id: parentId })
    .count<{ count: string }[]>({ count: "*" })
    .then((rows) => Number(rows[0]?.count ?? 0));
}
