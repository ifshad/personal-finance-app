"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_TYPES,
  createCategorySchema,
  type CreateCategoryInput,
} from "@/lib/validation/categories";
import { apiPost, ApiRequestError } from "@/lib/api-client";
import type { CategoryDto } from "@/server/services/categories.service";

type CreateCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryDto[];
  onSaved: () => void;
};

const NO_PARENT = "none";

export function CreateCategoryDialog({
  open,
  onOpenChange,
  categories,
  onSaved,
}: CreateCategoryDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "", type: "EXPENSE", parentId: null, icon: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ name: "", type: "EXPENSE", parentId: null, icon: "" });
    }
  }, [open, reset]);

  // useWatch (not form.watch()) so React Compiler can still memoize this
  // component — watch() returns a new subscription function each render.
  const selectedType = useWatch({ control, name: "type" });
  const topLevelOptions = categories.filter(
    (category) => category.parentId === null && category.type === selectedType,
  );

  async function onSubmit(values: CreateCategoryInput) {
    try {
      await apiPost("/api/categories", values);
      toast.success("Category created");
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
          <DialogTitle>Add category</DialogTitle>
          <DialogDescription>
            Create a top-level category, or a subcategory under an existing one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "INCOME" ? "Income" : "Expense"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent (optional)</Label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : NO_PARENT}
                  onValueChange={(value) =>
                    field.onChange(value === NO_PARENT ? null : Number(value))
                  }
                >
                  <SelectTrigger id="parentId" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PARENT}>None (top-level)</SelectItem>
                    {topLevelOptions.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Groceries" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating…" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
