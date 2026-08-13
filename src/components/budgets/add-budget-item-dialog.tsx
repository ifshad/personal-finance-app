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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPost, ApiRequestError } from "@/lib/api-client";
import { groupCategoriesByParent } from "@/lib/category-tree";
import type { CategoryDto } from "@/server/services/categories.service";

type AddBudgetItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: number;
  categories: CategoryDto[];
  existingCategoryIds: number[];
};

export function AddBudgetItemDialog({
  open,
  onOpenChange,
  budgetId,
  categories,
  existingCategoryIds,
}: AddBudgetItemDialogProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = categories.filter(
    (category) =>
      category.type === "EXPENSE" &&
      category.isActive &&
      !existingCategoryIds.includes(category.id),
  );
  const groups = groupCategoriesByParent(availableCategories, "EXPENSE");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryId || !plannedAmount) {
      toast.error("Choose a category and planned amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost(`/api/budgets/${budgetId}/items`, {
        categoryId: Number(categoryId),
        plannedAmount,
      });
      toast.success("Category added to budget");
      setCategoryId("");
      setPlannedAmount("");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add category to budget</DialogTitle>
          <DialogDescription>
            Plan how much you expect to spend in this category this period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {groups.length === 0 ? (
                  <SelectItem value="none" disabled>
                    All expense categories are already in this budget
                  </SelectItem>
                ) : (
                  groups.map(({ parent, children }) => (
                    <SelectGroup key={parent.id}>
                      <SelectLabel>{parent.name}</SelectLabel>
                      {!existingCategoryIds.includes(parent.id) && (
                        <SelectItem value={String(parent.id)}>General</SelectItem>
                      )}
                      {children.map((child) => (
                        <SelectItem key={child.id} value={String(child.id)}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedAmount">Planned amount</Label>
            <Input
              id="plannedAmount"
              inputMode="decimal"
              placeholder="0.00"
              value={plannedAmount}
              onChange={(event) => setPlannedAmount(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Adding…" : "Add to budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
