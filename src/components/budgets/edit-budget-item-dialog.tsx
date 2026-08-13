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
import { apiDelete, apiPatch, ApiRequestError } from "@/lib/api-client";
import type { BudgetItemDto } from "@/server/services/budgets.service";

type EditBudgetItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: number;
  item?: BudgetItemDto;
};

export function EditBudgetItemDialog({
  open,
  onOpenChange,
  budgetId,
  item,
}: EditBudgetItemDialogProps) {
  const router = useRouter();
  const [plannedAmount, setPlannedAmount] = useState(() => item?.plannedAmount ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!item) return;
    setIsSubmitting(true);
    try {
      await apiPatch(`/api/budgets/${budgetId}/items/${item.id}`, { plannedAmount });
      toast.success("Planned amount updated");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/budgets/${budgetId}/items/${item.id}`);
      toast.success("Removed from budget");
      setDeleteConfirmOpen(false);
      onOpenChange(false);
      router.refresh();
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{item?.categoryName}</DialogTitle>
            <DialogDescription>Update the planned amount, or remove it from this budget.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plannedAmount">Planned amount</Label>
              <Input
                id="plannedAmount"
                inputMode="decimal"
                value={plannedAmount}
                onChange={(event) => setPlannedAmount(event.target.value)}
              />
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Remove from budget
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {item?.categoryName} from this budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This only removes the plan — it doesn&apos;t change any transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
