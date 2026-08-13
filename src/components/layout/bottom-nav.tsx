"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Home, PiggyBank, Plus, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionFormSheet } from "@/components/transactions/transaction-form-sheet";
import type { AccountWithBalance } from "@/server/services/accounts.service";
import type { CategoryDto } from "@/server/services/categories.service";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/budgets", label: "Budget", icon: PiggyBank },
] as const;

const LINKS_AFTER_ADD = [
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/profile", label: "Me", icon: User },
] as const;

type BottomNavProps = {
  accounts: AccountWithBalance[];
  categories: CategoryDto[];
};

export function BottomNav({ accounts, categories }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  function handleAddClick() {
    if (accounts.length === 0) {
      toast.error("Add an account first", { description: "You need at least one account to record a transaction." });
      router.push("/accounts");
      return;
    }
    setAddOpen(true);
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-2">
          {LINKS.map((link) => (
            <NavItem key={link.href} {...link} isActive={pathname.startsWith(link.href)} />
          ))}

          <button
            type="button"
            onClick={handleAddClick}
            aria-label="Add transaction"
            className="-mt-5 flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
          >
            <Plus className="size-6" />
          </button>

          {LINKS_AFTER_ADD.map((link) => (
            <NavItem key={link.href} {...link} isActive={pathname.startsWith(link.href)} />
          ))}
        </div>
      </nav>

      <TransactionFormSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        accounts={accounts}
        categories={categories}
        onSaved={() => router.refresh()}
      />
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
