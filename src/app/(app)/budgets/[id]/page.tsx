import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api-error";
import { getServerAuthUser } from "@/server/auth/session";
import { getCurrentUser } from "@/server/services/auth.service";
import { getBudgetDetailForUser } from "@/server/services/budgets.service";
import { listCategories } from "@/server/services/categories.service";
import { BudgetDetailView } from "@/components/budgets/budget-detail-view";
import { parseIdParam } from "@/lib/parse-id-param";

type BudgetDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const budgetId = parseIdParam((await params).id);

  let budgetResult;
  try {
    budgetResult = await getBudgetDetailForUser(auth.userId, budgetId);
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const [user, categories] = await Promise.all([
    getCurrentUser(auth.userId),
    listCategories(auth.userId),
  ]);
  const budget = budgetResult;

  return (
    <BudgetDetailView
      budget={budget}
      categories={categories}
      currency={user.profile?.currency ?? "BDT"}
    />
  );
}
