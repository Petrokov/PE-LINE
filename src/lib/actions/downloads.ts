"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const downloadSchema = z.object({
  name_hr: z.string().min(2, "Naziv je obavezan"),
  name_sl: z.string().optional(),
  name_en: z.string().optional(),
  file_url: z.string().min(1, "Datoteka je obavezna"),
  language: z.enum(["hr", "sl", "en", "all"]),
  category_id: z.string().uuid().optional(),
  sort_order: z.coerce.number().default(0),
});

export type DownloadResult = { ok: boolean; message: string };

function readForm(formData: FormData) {
  const categoryId = String(formData.get("category_id") ?? "");
  return {
    name_hr: String(formData.get("name_hr") ?? ""),
    name_sl: String(formData.get("name_sl") ?? "") || undefined,
    name_en: String(formData.get("name_en") ?? "") || undefined,
    file_url: String(formData.get("file_url") ?? ""),
    language: String(formData.get("language") ?? "all"),
    category_id: categoryId || undefined,
    sort_order: formData.get("sort_order") || 0,
  };
}

export async function createDownload(
  _prev: DownloadResult | null,
  formData: FormData
): Promise<DownloadResult> {
  const parsed = downloadSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("downloads").insert(parsed.data);
  if (error) return { ok: false, message: "Greška pri spremanju datoteke." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/downloads");
  redirect("/admin/downloads");
}

export async function updateDownload(
  id: string,
  _prev: DownloadResult | null,
  formData: FormData
): Promise<DownloadResult> {
  const parsed = downloadSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("downloads").update(parsed.data).eq("id", id);
  if (error) return { ok: false, message: "Greška pri spremanju datoteke." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/downloads");
  redirect("/admin/downloads");
}

export async function deleteDownload(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("downloads").delete().eq("id", id);
  if (error) throw new Error("Greška pri brisanju datoteke.");
  revalidatePath("/", "layout");
  revalidatePath("/admin/downloads");
}
