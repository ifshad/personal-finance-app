import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { listAccountsForUser } from "@/server/services/accounts.service";
import { listCategories } from "@/server/services/categories.service";
import { getDashboardData } from "@/server/services/dashboard.service";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await getCurrentUser(auth.userId);
  const timezone = user.profile?.timezone ?? "Asia/Dhaka";
  const currency = user.profile?.currency ?? "BDT";
  const name = user.profile?.displayName || user.profile?.firstName || user.email;

  const [data, { accounts }, categories] = await Promise.all([
    getDashboardData(auth.userId, timezone),
    listAccountsForUser(auth.userId),
    listCategories(auth.userId),
  ]);

  const periodLabel = new Date(`${data.monthRange.start}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <DashboardView
      data={data}
      currency={currency}
      periodLabel={periodLabel}
      greetingName={name}
      accounts={accounts}
      categories={categories}
    />
  );
}
