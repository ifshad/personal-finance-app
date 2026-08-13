import { z } from "zod";

export const CATEGORY_TYPES = ["INCOME", "EXPENSE"] as const;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  type: z.enum(CATEGORY_TYPES),
  parentId: z.number().int().positive().nullable().optional(),
  icon: z.string().trim().max(50).nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// Type and parent are intentionally not editable after creation: changing
// type would contradict historical transactions that reference this
// category as INCOME/EXPENSE, and re-parenting adds hierarchy edge cases
// (cycles, orphaned grandchildren) with little MVP value.
export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  icon: z.string().trim().max(50).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
