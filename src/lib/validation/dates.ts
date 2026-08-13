import { z } from "zod";

/** Plain calendar date ("YYYY-MM-DD"), no time or timezone component. */
export const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date (YYYY-MM-DD)")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date");
