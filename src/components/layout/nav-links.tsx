"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/accounts", label: "Accounts" },
  { href: "/categories", label: "Categories" },
  { href: "/transactions", label: "Transactions" },
  { href: "/profile", label: "Me" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 overflow-x-auto text-sm">
      {LINKS.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap py-1 font-medium text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-primary",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
