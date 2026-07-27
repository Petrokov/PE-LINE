"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SETTINGS_ID } from "@/lib/constants";

const settingsSchema = z.object({
  site_name: z.string().optional(),
  logo_url: z.string().optional(),
  hero_image_url: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  map_url: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  footer_text_hr: z.string().optional(),
  footer_text_sl: z.string().optional(),
  footer_text_en: z.string().optional(),
});

export type SettingsResult = { ok: boolean; message: string };

function readForm(formData: FormData) {
  const fields = [
    "site_name",
    "logo_url",
    "hero_image_url",
    "phone",
    "email",
    "address",
    "map_url",
    "facebook",
    "instagram",
    "linkedin",
    "youtube",
    "footer_text_hr",
    "footer_text_sl",
    "footer_text_en",
  ] as const;

  return Object.fromEntries(
    fields.map((f) => [f, String(formData.get(f) ?? "") || undefined])
  );
}

export async function updateSettings(
  _prev: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult> {
  const parsed = settingsSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("settings").update(parsed.data).eq("id", SETTINGS_ID);
  if (error) return { ok: false, message: "Greška pri spremanju postavki." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Postavke spremljene." };
}
