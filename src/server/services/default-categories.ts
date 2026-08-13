import type { Knex } from "knex";
import type { CategoryType } from "@/types/db";

type DefaultCategoryNode = {
  name: string;
  children?: DefaultCategoryNode[];
};

// Mirrors the spreadsheet concepts from docs/01-product-requirements.md §6,
// regrouped into the clean category/subcategory hierarchy described in
// docs/02-financial-model.md §7. Seeded once per new user at registration.
const DEFAULT_INCOME_CATEGORIES: DefaultCategoryNode[] = [
  { name: "Salary" },
  { name: "Freelance" },
  { name: "Bonus" },
  { name: "Other Income" },
];

const DEFAULT_EXPENSE_CATEGORIES: DefaultCategoryNode[] = [
  {
    name: "Housing",
    children: [
      { name: "Rent" },
      { name: "Service Charge" },
      { name: "Gas" },
      { name: "Electricity" },
      { name: "Internet" },
    ],
  },
  {
    name: "Transport",
    children: [
      { name: "Bike Fuel" },
      { name: "Bike Maintenance" },
      { name: "Parking" },
      { name: "Garage Bill" },
      { name: "Toll" },
    ],
  },
  {
    name: "Food",
    children: [{ name: "Office Lunch" }, { name: "Bazar" }, { name: "Daily" }],
  },
  {
    name: "Family",
    children: [
      { name: "Ammu" },
      { name: "Abbu" },
      { name: "Shila" },
      { name: "Shila Education" },
      { name: "Shila Shopping" },
    ],
  },
  {
    name: "Personal",
    children: [{ name: "My Shopping" }, { name: "Mobile" }, { name: "Home Appliance" }],
  },
  {
    name: "Travel",
    children: [{ name: "Going Home" }, { name: "Rajshahi" }],
  },
  {
    name: "Finance",
    children: [{ name: "Debt" }, { name: "Savings" }],
  },
  {
    name: "Other",
    children: [{ name: "Extra" }],
  },
];

async function seedTree(
  conn: Knex,
  userId: number,
  type: CategoryType,
  nodes: DefaultCategoryNode[],
): Promise<void> {
  for (const node of nodes) {
    const [parentId] = await conn("categories").insert({
      user_id: userId,
      parent_id: null,
      name: node.name,
      type,
      icon: null,
    });

    if (node.children?.length) {
      const childRows = node.children.map((child) => ({
        user_id: userId,
        parent_id: parentId,
        name: child.name,
        type,
        icon: null,
      }));
      await conn("categories").insert(childRows);
    }
  }
}

/**
 * Creates the default category set for a brand-new user. Must run in the
 * same transaction as user creation so a failure never leaves a user
 * without any categories to record transactions against.
 */
export async function seedDefaultCategoriesForUser(
  conn: Knex,
  userId: number,
): Promise<void> {
  await seedTree(conn, userId, "INCOME", DEFAULT_INCOME_CATEGORIES);
  await seedTree(conn, userId, "EXPENSE", DEFAULT_EXPENSE_CATEGORIES);
}
