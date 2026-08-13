import { NavLinks } from "@/components/layout/nav-links";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getServerAuthUser } from "@/server/auth/session";
import { listAccountsForUser } from "@/server/services/accounts.service";
import { listCategories } from "@/server/services/categories.service";

// Mobile-first bottom navigation (Home, Budget, Add, Reports, Me) per
// docs/04-ui-ux-specification.md §2, with a simple top nav taking over on
// desktop/tablet per §17 ("adapt to a sidebar/top navigation... preserving
// the same information architecture").
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuthUser();

  // Every page under this layout is already gated by proxy.ts, so `auth`
  // should never be null here — this is just a defensive fallback rather
  // than a real code path.
  const [accounts, categories] = auth
    ? await Promise.all([
        listAccountsForUser(auth.userId).then((result) => result.accounts),
        listCategories(auth.userId),
      ])
    : [[], []];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="hidden border-b border-border bg-card px-4 py-3 md:block">
        <NavLinks />
      </header>
      <main className="flex-1">{children}</main>
      {auth && <BottomNav accounts={accounts} categories={categories} />}
    </div>
  );
}
