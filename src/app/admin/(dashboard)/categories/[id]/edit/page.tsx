import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import type { Category } from "@/lib/types";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: category }, { data: topLevel }] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id, name_hr, name_sl, name_en, slug, icon, heroImageUrl:hero_image_url, " +
          "description_hr, description_sl, description_en, sortOrder:sort_order, parentId:parent_id"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name_hr").is("parent_id", null).order("sort_order"),
  ]);

  if (!category) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Uredi kategoriju</h1>
      <CategoryForm
        action={updateCategory.bind(null, id)}
        category={category as unknown as Category}
        topLevelCategories={(topLevel ?? []) as unknown as Category[]}
        submitLabel="Spremi promjene"
      />
    </div>
  );
}
