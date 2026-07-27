import { createClient } from "@/lib/supabase/server";
import { createCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import type { Category } from "@/lib/types";

export default async function NewCategoryPage() {
  const supabase = await createClient();
  const { data: topLevel } = await supabase
    .from("categories")
    .select("id, name_hr")
    .is("parent_id", null)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Nova kategorija</h1>
      <CategoryForm
        action={createCategory}
        topLevelCategories={(topLevel ?? []) as unknown as Category[]}
        submitLabel="Spremi"
      />
    </div>
  );
}
