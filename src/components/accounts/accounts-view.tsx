"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountFormDialog } from "./account-form-dialog";
import { formatMoney } from "@/lib/format-money";
import type { AccountWithBalance } from "@/server/services/accounts.service";

type AccountsViewProps = {
  accounts: AccountWithBalance[];
  totalBalance: string;
  currency: string;
};

export function AccountsView({ accounts, totalBalance, currency }: AccountsViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithBalance | undefined>();

  function handleSaved() {
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total balance</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatMoney(totalBalance, currency)}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add
        </Button>
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Create your first account to start tracking your money.
        </p>
      ) : (
        <ul className="space-y-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => setEditingAccount(account)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{account.name}</span>
                    {!account.isActive && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{account.accountType}</p>
                </div>
                <span className="font-medium text-foreground">
                  {formatMoney(account.currentBalance, currency)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <AccountFormDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={handleSaved} />
      <AccountFormDialog
        open={Boolean(editingAccount)}
        onOpenChange={(open) => !open && setEditingAccount(undefined)}
        account={editingAccount}
        onSaved={handleSaved}
      />
    </div>
  );
}
