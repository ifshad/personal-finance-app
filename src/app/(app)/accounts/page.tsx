import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { listAccountsForUser } from "@/server/services/accounts.service";
import { AccountsView } from "@/components/accounts/accounts-view";

export default async function AccountsPage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const [user, { accounts, totalBalance }] = await Promise.all([
    getCurrentUser(auth.userId),
    listAccountsForUser(auth.userId),
  ]);

  return (
    <AccountsView
      accounts={accounts}
      totalBalance={totalBalance}
      currency={user.profile?.currency ?? "BDT"}
    />
  );
}
