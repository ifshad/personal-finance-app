"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateCategoryDialog } from "./create-category-dialog";
import { EditCategoryDialog } from "./edit-category-dialog";
import { groupCategoriesByParent } from "@/lib/category-tree";
import type { CategoryDto } from "@/server/services/categories.service";
import type { CategoryType } from "@/types/db";

type CategoriesViewProps = {
  categories: CategoryDto[];
};

function CategoryGroup({
  title,
  type,
  categories,
  onEdit,
}: {
  title: string;
  type: CategoryType;
  categories: CategoryDto[];
  onEdit: (category: CategoryDto) => void;
}) {
  const groups = groupCategoriesByParent(categories, type);
  if (groups.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
      <ul className="space-y-1">
        {groups.map(({ parent, children }) => (
          <li key={parent.id}>
            <CategoryRow category={parent} onEdit={onEdit} />
            {children.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                {children.map((child) => (
                  <li key={child.id}>
                    <CategoryRow category={child} onEdit={onEdit} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryRow({
  category,
  onEdit,
}: {
  category: CategoryDto;
  onEdit: (category: CategoryDto) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(category)}
      className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
    >
      <span className={category.isActive ? "text-foreground" : "text-muted-foreground"}>
        {category.name}
      </span>
      {!category.isActive && <Badge variant="secondary">Inactive</Badge>}
    </button>
  );
}

export function CategoriesView({ categories }: CategoriesViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | undefined>();

  function handleSaved() {
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Categories</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No categories yet. Add your first income or expense category.
        </p>
      ) : (
        <div className="space-y-6">
          <CategoryGroup
            title="Income"
            type="INCOME"
            categories={categories}
            onEdit={setEditingCategory}
          />
          <CategoryGroup
            title="Expense"
            type="EXPENSE"
            categories={categories}
            onEdit={setEditingCategory}
          />
        </div>
      )}

      <CreateCategoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        onSaved={handleSaved}
      />
      <EditCategoryDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(undefined)}
        category={editingCategory}
        onSaved={handleSaved}
      />
    </div>
  );
}
