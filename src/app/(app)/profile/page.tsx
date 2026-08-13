import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, Tags, Receipt, ChevronRight } from "lucide-react";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { ProfileForm } from "@/components/auth/profile-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const MANAGE_LINKS = [
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/transactions", label: "Transaction history", icon: Receipt },
];

export default async function ProfilePage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const user = await getCurrentUser(auth.userId);

  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-6 p-4 pb-24">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Your profile</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Manage</h2>
        <ul className="overflow-hidden rounded-lg border border-border bg-card">
          {MANAGE_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href} className="border-b border-border last:border-0">
              <Link
                href={href}
                className="flex items-center gap-3 px-3 py-3 text-sm transition-colors hover:bg-accent"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="flex-1 text-foreground">{label}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Appearance</h2>
        <ThemeToggle />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Profile</h2>
        <ProfileForm user={user} />
      </div>

      <LogoutButton />
    </div>
  );
}
