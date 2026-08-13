"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCOUNT_TYPES } from "@/lib/validation/accounts";
import { decimalAmountSchema } from "@/lib/validation/money";
import { apiPatch, apiPost, ApiRequestError } from "@/lib/api-client";
import type { AccountWithBalance } from "@/server/services/accounts.service";

const ACCOUNT_TYPE_LABELS: Record<(typeof ACCOUNT_TYPES)[number], string> = {
  CASH: "Cash",
  BANK: "Bank",
  MOBILE_WALLET: "Mobile Wallet",
  CARD: "Card",
  OTHER: "Other",
};

type AccountFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountWithBalance;
  onSaved: () => void;
};

// One shape covers both create and edit — the server's create/update schemas
// (src/lib/validation/accounts.ts) are the actual source of truth and still
// validate the request; `isActive` is simply ignored by the create route.
const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  accountType: z.enum(ACCOUNT_TYPES),
  openingBalance: decimalAmountSchema,
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof accountFormSchema>;

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
  onSaved,
}: AccountFormDialogProps) {
  const isEdit = Boolean(account);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      accountType: "CASH",
      openingBalance: "0",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: account?.name ?? "",
        accountType: account?.accountType ?? "CASH",
        openingBalance: account?.openingBalance ?? "0",
        isActive: account?.isActive ?? true,
      });
    }
  }, [open, account, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && account) {
        await apiPatch(`/api/accounts/${account.id}`, values);
        toast.success("Account updated");
      } else {
        await apiPost("/api/accounts", values);
        toast.success("Account created");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : "Something went wrong";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this account's details or deactivate it."
              : "Add a place where you hold money, like Cash or Bank."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Bank" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Type</Label>
            <Controller
              name="accountType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="accountType" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {ACCOUNT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="openingBalance">Opening balance</Label>
            <Input
              id="openingBalance"
              inputMode="decimal"
              placeholder="0.00"
              {...register("openingBalance")}
            />
            {errors.openingBalance && (
              <p className="text-sm text-destructive">{errors.openingBalance.message}</p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive accounts are hidden from new transactions.
                </p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
