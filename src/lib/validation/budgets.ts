import { z } from "zod";
import { decimalAmountSchema } from "./money";
import { isoDateSchema } from "./dates";

export const createBudgetSchema = z
  .object({
    name: z.string().trim().min(1).max(150).nullable().optional(),
    periodStart: isoDateSchema,
    periodEnd: isoDateSchema,
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "End date must be on or after the start date",
    path: ["periodEnd"],
  });

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const createBudgetItemSchema = z.object({
  categoryId: z.number().int().positive(),
  plannedAmount: decimalAmountSchema,
});

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>;

export const updateBudgetItemSchema = z.object({
  plannedAmount: decimalAmountSchema,
});

export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>;
