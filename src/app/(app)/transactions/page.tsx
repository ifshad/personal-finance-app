import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { listAccountsForUser } from "@/server/services/accounts.service";
import { listCategories } from "@/server/services/categories.service";
import { listTransactionsForUser } from "@/server/services/transactions.service";
import { TransactionsView } from "@/components/transactions/transactions-view";

export default async function TransactionsPage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const [user, { accounts }, categories, transactions] = await Promise.all([
    getCurrentUser(auth.userId),
    listAccountsForUser(auth.userId),
    listCategories(auth.userId),
    listTransactionsForUser(auth.userId, { page: 1, pageSize: 20 }),
  ]);

  return (
    <TransactionsView
      initial={transactions}
      accounts={accounts}
      categories={categories}
      currency={user.profile?.currency ?? "BDT"}
    />
  );
}
