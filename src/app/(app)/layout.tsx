import { NavLinks } from "@/components/layout/nav-links";

// Minimal top navigation so every authenticated page is reachable during
// development. Replaced by the mobile-first bottom navigation (Home,
// Budget, Add, Reports, Me) in Phase 7 — see docs/04-ui-ux-specification.md §2.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-card px-4 py-3">
        <NavLinks />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
