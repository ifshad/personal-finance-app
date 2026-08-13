import type { NextRequest } from "next/server";
import { apiSuccess, withApiErrorHandling } from "@/lib/api-response";
import { requireUser } from "@/server/auth/session";
import { reportQuerySchema } from "@/lib/validation/reports";
import { getCurrentUser } from "@/server/services/auth.service";
import { getReportData } from "@/server/services/reports.service";

export const GET = withApiErrorHandling(async (request: NextRequest) => {
  const auth = await requireUser(request);
  const query = reportQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

  const user = await getCurrentUser(auth.userId);
  const timezone = user.profile?.timezone ?? "Asia/Dhaka";

  const report = await getReportData(auth.userId, timezone, query);
  return apiSuccess({ report });
});
