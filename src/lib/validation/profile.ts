import { z } from "zod";

// ISO 4217-style currency code (e.g. BDT, USD). Keep this permissive; the
// exact supported list can be tightened later without a migration.
const currencyCode = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase());

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  displayName: z.string().trim().min(1).max(150).optional(),
  phone: z.string().trim().max(30).optional(),
  currency: currencyCode.optional(),
  timezone: z.string().trim().min(1).max(50).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
