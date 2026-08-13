import { z } from "zod";
import { isoDateSchema } from "./dates";

export const REPORT_PERIOD_TYPES = ["today", "week", "month", "half-year", "year", "custom"] as const;

export const reportQuerySchema = z
  .object({
    periodType: z.enum(REPORT_PERIOD_TYPES).default("month"),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    half: z.coerce.number().int().min(1).max(2).optional(),
    dateFrom: isoDateSchema.optional(),
    dateTo: isoDateSchema.optional(),
  })
  .refine(
    (data) => data.periodType !== "custom" || (data.dateFrom && data.dateTo),
    { message: "A custom period requires both dateFrom and dateTo", path: ["dateFrom"] },
  );

export type ReportQuery = z.infer<typeof reportQuerySchema>;
