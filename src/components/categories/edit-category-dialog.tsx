"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";
import { updateCategorySchema, type UpdateCategoryInput } from "@/lib/validation/categories";
import { apiPatch, ApiRequestError } from "@/lib/api-client";
import type { CategoryDto } from "@/server/services/categories.service";

type EditCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryDto;
  onSaved: () => void;
};

export function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: EditCategoryDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: { name: "", icon: "", isActive: true },
  });

  useEffect(() => {
    if (open && category) {
      reset({ name: category.name, icon: category.icon ?? "", isActive: category.isActive });
    }
  }, [open, category, reset]);

  async function onSubmit(values: UpdateCategoryInput) {
    if (!category) return;
    try {
      await apiPatch(`/api/categories/${category.id}`, values);
      toast.success("Category updated");
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
          <DialogTitle>Edit category</DialogTitle>
          <DialogDescription>
            {category?.type === "INCOME" ? "Income" : "Expense"} category
            {category?.parentId ? " (subcategory)" : ""}. Type can&apos;t be changed after
            creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive categories are hidden from new transactions.
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

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
