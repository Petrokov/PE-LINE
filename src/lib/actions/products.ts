"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const specSchema = z.object({ key: z.string().min(1), value: z.string().min(1) });

const productSchema = z.object({
  name_hr: z.string().min(2, "Naziv je obavezan"),
  name_sl: z.string().optional(),
  name_en: z.string().optional(),
  slug: z.string().min(2),
  description_hr: z.string().optional(),
  description_sl: z.string().optional(),
  description_en: z.string().optional(),
  price_range: z.string().optional(),
  featured: z.boolean(),
  category_id: z.string().uuid("Odaberite kategoriju"),
  images: z.array(z.string()).default([]),
  specs: z.array(specSchema).default([]),
});

export type ProductResult = { ok: boolean; message: string };

function readForm(formData: FormData) {
  const nameHr = String(formData.get("name_hr") ?? "");
  const slugField = String(formData.get("slug") ?? "");

  let specs: unknown = [];
  try {
    specs = JSON.parse(String(formData.get("specs") || "[]"));
  } catch {
    specs = [];
  }

  return {
    name_hr: nameHr,
    name_sl: String(formData.get("name_sl") ?? "") || undefined,
    name_en: String(formData.get("name_en") ?? "") || undefined,
    slug: slugField || slugify(nameHr),
    description_hr: String(formData.get("description_hr") ?? "") || undefined,
    description_sl: String(formData.get("description_sl") ?? "") || undefined,
    description_en: String(formData.get("description_en") ?? "") || undefined,
    price_range: String(formData.get("price_range") ?? "") || undefined,
    featured: formData.get("featured") === "on",
    category_id: formData.get("category_id"),
    images: formData.getAll("images").map(String).filter(Boolean),
    specs,
  };
}

export async function createProduct(
  _prev: ProductResult | null,
  formData: FormData
): Promise<ProductResult> {
  const parsed = productSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(parsed.data);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Slug već postoji, odaberite drugi." };
    return { ok: false, message: "Greška pri spremanju proizvoda." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductResult | null,
  formData: FormData
): Promise<ProductResult> {
  const parsed = productSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Slug već postoji, odaberite drugi." };
    return { ok: false, message: "Greška pri spremanju proizvoda." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error("Greška pri brisanju proizvoda.");
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
}
