"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { apiPost, ApiRequestError } from "@/lib/api-client";
import { getMonthRange } from "@/lib/period";
import type { BudgetDto } from "@/server/services/budgets.service";

type CreateBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function CreateBudgetDialog({ open, onOpenChange }: CreateBudgetDialogProps) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonthValue());
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const [year, monthNum] = month.split("-").map(Number);
    if (!year || !monthNum) {
      toast.error("Pick a month");
      return;
    }
    const { start, end } = getMonthRange(year, monthNum);

    setIsSubmitting(true);
    try {
      const { budget } = await apiPost<{ budget: BudgetDto }>("/api/budgets", {
        name: name || null,
        periodStart: start,
        periodEnd: end,
      });
      toast.success("Budget created");
      onOpenChange(false);
      router.push(`/budgets/${budget.id}`);
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a monthly budget</DialogTitle>
          <DialogDescription>
            Plan spending for a month, then track it against real transactions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="e.g. August budget"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating…" : "Create budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
