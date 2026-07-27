import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateTeamMember } from "@/lib/actions/team";
import { TeamMemberForm } from "@/components/admin/team-member-form";
import type { TeamMember } from "@/lib/types";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("team_members")
    .select("id, name, role_hr, role_sl, role_en, photoUrl:photo_url, bio_hr, sortOrder:sort_order")
    .eq("id", id)
    .maybeSingle();

  if (!member) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Uredi člana tima</h1>
      <TeamMemberForm
        action={updateTeamMember.bind(null, id)}
        member={member as unknown as TeamMember}
        submitLabel="Spremi promjene"
      />
    </div>
  );
}
