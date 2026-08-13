import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { listBudgetsForUser } from "@/server/services/budgets.service";
import { BudgetsView } from "@/components/budgets/budgets-view";

export default async function BudgetsPage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const [user, budgets] = await Promise.all([
    getCurrentUser(auth.userId),
    listBudgetsForUser(auth.userId),
  ]);

  return <BudgetsView budgets={budgets} currency={user.profile?.currency ?? "BDT"} />;
}
