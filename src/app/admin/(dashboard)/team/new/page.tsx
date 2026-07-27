import { createTeamMember } from "@/lib/actions/team";
import { TeamMemberForm } from "@/components/admin/team-member-form";

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Novi član tima</h1>
      <TeamMemberForm action={createTeamMember} submitLabel="Spremi" />
    </div>
  );
}
