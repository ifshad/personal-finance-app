import { z } from "zod";
import { decimalAmountSchema } from "./money";

export const ACCOUNT_TYPES = ["CASH", "BANK", "MOBILE_WALLET", "CARD", "OTHER"] as const;

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  accountType: z.enum(ACCOUNT_TYPES),
  openingBalance: decimalAmountSchema.default("0"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  accountType: z.enum(ACCOUNT_TYPES).optional(),
  openingBalance: decimalAmountSchema.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
