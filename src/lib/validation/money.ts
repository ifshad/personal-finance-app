import { z } from "zod";

/**
 * Decimal amount as a string ("1234.50", "0.5", "500") — never a JS
 * number — so a value never crosses the API boundary as a float.
 * See src/server/services/money.ts for the arithmetic side of this rule.
 */
export const decimalAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount with up to 2 decimal places");

/** Same as `decimalAmountSchema`, but rejects zero — for transaction amounts. */
export const positiveDecimalAmountSchema = decimalAmountSchema.refine(
  (value) => !/^0(\.0{1,2})?$/.test(value),
  { message: "Amount must be greater than 0" },
);
