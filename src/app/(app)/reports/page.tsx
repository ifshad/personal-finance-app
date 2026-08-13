import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { getReportData } from "@/server/services/reports.service";
import { ReportsView } from "@/components/reports/reports-view";
import type { ReportQuery } from "@/lib/validation/reports";

export default async function ReportsPage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await getCurrentUser(auth.userId);
  const timezone = user.profile?.timezone ?? "Asia/Dhaka";
  const currency = user.profile?.currency ?? "BDT";

  const initialQuery: ReportQuery = { periodType: "month" };
  const initialReport = await getReportData(auth.userId, timezone, initialQuery);

  return (
    <ReportsView initialReport={initialReport} initialQuery={initialQuery} currency={currency} />
  );
}
