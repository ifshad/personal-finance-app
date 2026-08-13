import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

// Placeholder landing page for Phase 1 (auth). The real dashboard
// (balances, budget progress, charts, recent transactions) is built in
// Phase 5 once accounts, categories, transactions, and budgets exist.
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
        accounts, transactions, and budgets are implemented.
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/profile" />}>Complete your profile</Button>
        <LogoutButton />
      </div>
    </div>
  );
}
