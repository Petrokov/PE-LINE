"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const galleryImageSchema = z.object({
  image_url: z.string().min(1, "Slika je obavezna"),
  alt_hr: z.string().optional(),
  caption_hr: z.string().optional(),
  sort_order: z.coerce.number().default(0),
});

export type GalleryImageResult = { ok: boolean; message: string };

function readForm(formData: FormData) {
  return {
    image_url: String(formData.get("image_url") ?? ""),
    alt_hr: String(formData.get("alt_hr") ?? "") || undefined,
    caption_hr: String(formData.get("caption_hr") ?? "") || undefined,
    sort_order: formData.get("sort_order") || 0,
  };
}

export async function createGalleryImage(
  _prev: GalleryImageResult | null,
  formData: FormData
): Promise<GalleryImageResult> {
  const parsed = galleryImageSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").insert(parsed.data);
  if (error) return { ok: false, message: "Greška pri spremanju slike." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function updateGalleryImage(
  id: string,
  _prev: GalleryImageResult | null,
  formData: FormData
): Promise<GalleryImageResult> {
  const parsed = galleryImageSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").update(parsed.data).eq("id", id);
  if (error) return { ok: false, message: "Greška pri spremanju slike." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) throw new Error("Greška pri brisanju slike.");
  revalidatePath("/", "layout");
  revalidatePath("/admin/gallery");
}
