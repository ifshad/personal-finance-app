import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/server/auth/session";
import { listCategories } from "@/server/services/categories.service";
import { CategoriesView } from "@/components/categories/categories-view";

export default async function CategoriesPage() {
  const auth = await getServerAuthUser();
  if (!auth) {
    redirect("/login");
  }

  const categories = await listCategories(auth.userId);

  return <CategoriesView categories={categories} />;
}
