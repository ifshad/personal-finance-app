"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiDelete, apiPatch, apiPost, ApiRequestError } from "@/lib/api-client";
import { groupCategoriesByParent } from "@/lib/category-tree";
import type { AccountWithBalance } from "@/server/services/accounts.service";
import type { CategoryDto } from "@/server/services/categories.service";
import type { TransactionDto } from "@/server/services/transactions.service";
import type { TransactionType } from "@/types/db";

type TransactionFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionDto;
  accounts: AccountWithBalance[];
  categories: CategoryDto[];
  onSaved: () => void;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function accountOptions(accounts: AccountWithBalance[], currentId?: number | null) {
  return accounts.filter((account) => account.isActive || account.id === currentId);
}

export function TransactionFormSheet({
  open,
  onOpenChange,
  transaction,
  accounts,
  categories,
  onSaved,
}: TransactionFormSheetProps) {
  const router = useRouter();
  const isEdit = Boolean(transaction);

  // The Sheet unmounts its content when closed (no `keepMounted`), so a
  // fresh mount happens every time it opens — lazy initial state read from
  // `transaction` is enough to show the right values, with no effect
  // needed to "reset" anything.
  const [type, setType] = useState<TransactionType>(() => transaction?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(() => transaction?.amount ?? "");
  const [accountId, setAccountId] = useState(() =>
    transaction?.accountId ? String(transaction.accountId) : "",
  );
  const [categoryId, setCategoryId] = useState(() =>
    transaction?.categoryId ? String(transaction.categoryId) : "",
  );
  const [fromAccountId, setFromAccountId] = useState(() =>
    transaction?.fromAccountId ? String(transaction.fromAccountId) : "",
  );
  const [toAccountId, setToAccountId] = useState(() =>
    transaction?.toAccountId ? String(transaction.toAccountId) : "",
  );
  const [transactionDate, setTransactionDate] = useState(
    () => transaction?.transactionDate ?? today(),
  );
  const [description, setDescription] = useState(() => transaction?.description ?? "");
  const [notes, setNotes] = useState(() => transaction?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const availableAccounts = accountOptions(
    accounts,
    isEdit ? (transaction?.accountId ?? null) : null,
  );
  const availableFromAccounts = accountOptions(
    accounts,
    isEdit ? (transaction?.fromAccountId ?? null) : null,
  );
  const availableToAccounts = accountOptions(
    accounts,
    isEdit ? (transaction?.toAccountId ?? null) : null,
  );
  const categoryType = type as "INCOME" | "EXPENSE";
  const currentCategoryId = isEdit ? (transaction?.categoryId ?? null) : null;
  const availableCategories = categories.filter(
    (category) =>
      category.type === categoryType &&
      (category.isActive || category.id === currentCategoryId),
  );
  const categoryGroups = groupCategoriesByParent(availableCategories, categoryType);

  function isFormValid(): boolean {
    if (!amount || !/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) return false;
    if (!transactionDate) return false;
    if (type === "TRANSFER") {
      return Boolean(fromAccountId) && Boolean(toAccountId) && fromAccountId !== toAccountId;
    }
    return Boolean(accountId) && Boolean(categoryId);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const shared = {
      amount,
      transactionDate,
      description: description || null,
      notes: notes || null,
    };

    setIsSubmitting(true);
    try {
      if (isEdit && transaction) {
        const payload =
          transaction.type === "TRANSFER"
            ? { ...shared, fromAccountId: Number(fromAccountId), toAccountId: Number(toAccountId) }
            : { ...shared, accountId: Number(accountId), categoryId: Number(categoryId) };
        await apiPatch(`/api/transactions/${transaction.id}`, payload);
        toast.success("Transaction updated");
      } else {
        const payload =
          type === "TRANSFER"
            ? { type, ...shared, fromAccountId: Number(fromAccountId), toAccountId: Number(toAccountId) }
            : { type, ...shared, accountId: Number(accountId), categoryId: Number(categoryId) };
        await apiPost("/api/transactions", payload);
        toast.success("Transaction added");
      }
      onOpenChange(false);
      router.refresh();
      onSaved();
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/transactions/${transaction.id}`);
      toast.success("Transaction deleted");
      setDeleteConfirmOpen(false);
      onOpenChange(false);
      router.refresh();
      onSaved();
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit transaction" : "Add transaction"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Transaction type can't be changed. Delete and re-add if you picked the wrong type."
              : "Record income, an expense, or a transfer between your accounts."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
          {isEdit ? (
            <p className="text-sm font-medium text-muted-foreground">{transaction?.type}</p>
          ) : (
            <Tabs value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <TabsList className="w-full">
                <TabsTrigger value="EXPENSE" className="flex-1">
                  Expense
                </TabsTrigger>
                <TabsTrigger value="INCOME" className="flex-1">
                  Income
                </TabsTrigger>
                <TabsTrigger value="TRANSFER" className="flex-1">
                  Transfer
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              autoFocus
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          {type === "TRANSFER" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fromAccountId">From account</Label>
                <Select
                  value={fromAccountId}
                  onValueChange={(value) => setFromAccountId(value ?? "")}
                >
                  <SelectTrigger id="fromAccountId" className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFromAccounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toAccountId">To account</Label>
                <Select
                  value={toAccountId}
                  onValueChange={(value) => setToAccountId(value ?? "")}
                >
                  <SelectTrigger id="toAccountId" className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAccounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => setCategoryId(value ?? "")}
                >
                  <SelectTrigger id="categoryId" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryGroups.map(({ parent, children }) => (
                      <SelectGroup key={parent.id}>
                        <SelectLabel>{parent.name}</SelectLabel>
                        <SelectItem value={String(parent.id)}>General</SelectItem>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={String(child.id)}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account</Label>
                <Select
                  value={accountId}
                  onValueChange={(value) => setAccountId(value ?? "")}
                >
                  <SelectTrigger id="accountId" className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="transactionDate">Date</Label>
            <Input
              id="transactionDate"
              type="date"
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Groceries"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <SheetFooter className="flex-col gap-2 px-0">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add transaction"}
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete transaction
              </Button>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. Account balances will be recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
