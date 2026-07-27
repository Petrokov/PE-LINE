"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const teamMemberSchema = z.object({
  name: z.string().min(2, "Ime je obavezno"),
  role_hr: z.string().optional(),
  role_sl: z.string().optional(),
  role_en: z.string().optional(),
  photo_url: z.string().optional(),
  bio_hr: z.string().optional(),
  sort_order: z.coerce.number().default(0),
});

export type TeamMemberResult = { ok: boolean; message: string };

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    role_hr: String(formData.get("role_hr") ?? "") || undefined,
    role_sl: String(formData.get("role_sl") ?? "") || undefined,
    role_en: String(formData.get("role_en") ?? "") || undefined,
    photo_url: String(formData.get("photo_url") ?? "") || undefined,
    bio_hr: String(formData.get("bio_hr") ?? "") || undefined,
    sort_order: formData.get("sort_order") || 0,
  };
}

export async function createTeamMember(
  _prev: TeamMemberResult | null,
  formData: FormData
): Promise<TeamMemberResult> {
  const parsed = teamMemberSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("team_members").insert(parsed.data);
  if (error) return { ok: false, message: "Greška pri spremanju člana tima." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function updateTeamMember(
  id: string,
  _prev: TeamMemberResult | null,
  formData: FormData
): Promise<TeamMemberResult> {
  const parsed = teamMemberSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, message: "Provjerite unesene podatke." };

  const supabase = await createClient();
  const { error } = await supabase.from("team_members").update(parsed.data).eq("id", id);
  if (error) return { ok: false, message: "Greška pri spremanju člana tima." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error("Greška pri brisanju člana tima.");
  revalidatePath("/", "layout");
  revalidatePath("/admin/team");
}
