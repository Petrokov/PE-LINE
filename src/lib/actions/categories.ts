"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const categorySchema = z.object({
  name_hr: z.string().min(2, "Naziv je obavezan"),
  name_sl: z.string().optional(),
  name_en: z.string().optional(),
  slug: z.string().min(2),
  description_hr: z.string().optional(),
  description_sl: z.string().optional(),
  description_en: z.string().optional(),
  icon: z.string().optional(),
  hero_image_url: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  sort_order: z.coerce.number().default(0),
});

export type CategoryResult = { ok: boolean; message: string };

function readForm(formData: FormData) {
  const nameHr = String(formData.get("name_hr") ?? "");
  const slugField = String(formData.get("slug") ?? "");
  const parentId = String(formData.get("parent_id") ?? "");

  return {
    name_hr: nameHr,
    name_sl: String(formData.get("name_sl") ?? "") || undefined,
    name_en: String(formData.get("name_en") ?? "") || undefined,
    slug: slugField || slugify(nameHr),
    description_hr: String(formData.get("description_hr") ?? "") || undefined,
    description_sl: String(formData.get("description_sl") ?? "") || undefined,
    description_en: String(formData.get("description_en") ?? "") || undefined,
    icon: String(formData.get("icon") ?? "") || undefined,
    hero_image_url: String(formData.get("hero_image_url") ?? "") || undefined,
    parent_id: parentId || undefined,
    sort_order: formData.get("sort_order") || 0,
  };
}

export async function createCategory(
  _prev: CategoryResult | null,
  formData: FormData
): Promise<CategoryResult> {
  const parsed = categorySchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Slug već postoji, odaberite drugi." };
    return { ok: false, message: "Greška pri spremanju kategorije." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  _prev: CategoryResult | null,
  formData: FormData
): Promise<CategoryResult> {
  const parsed = categorySchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update(parsed.data).eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Slug već postoji, odaberite drugi." };
    return { ok: false, message: "Greška pri spremanju kategorije." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    throw new Error(
      error.code === "23503"
        ? "Ova kategorija ima podkategorije ili proizvode — obrišite ih prvo."
        : "Greška pri brisanju kategorije."
    );
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
}
