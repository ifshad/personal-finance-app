import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { LogoutButton } from "@/components/auth/logout-button";

// Placeholder landing page. The real dashboard (balances, budget progress,
// charts, recent transactions) is built in Phase 5 once budgets exist too.
// Use the nav above to manage accounts, categories, and transactions.
export default async function DashboardPage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await getCurrentUser(auth.userId);
  const name = user.profile?.displayName || user.profile?.firstName || user.email;

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4 pb-24">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Welcome, {name}
        </h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re logged in as {user.email}.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        The full dashboard (balances, budgets, charts) will appear here once
        budgets are implemented in Phase 4.
      </p>
      <LogoutButton />
    </div>
  );
}
