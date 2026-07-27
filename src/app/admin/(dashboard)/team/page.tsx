import Link from "next/link";
import { getTeam } from "@/lib/queries";
import { deleteTeamMember } from "@/lib/actions/team";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminTable } from "@/components/admin/admin-table";

export default async function TeamListPage() {
  const team = await getTeam();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Tim</h1>
        <Link
          href="/admin/team/new"
          className="bg-petrol text-white rounded-[10px] px-4 py-2 text-sm font-semibold"
        >
          + Novi član
        </Link>
      </div>

      <AdminTable headers={["Ime", "Uloga", ""]}>
        {team.map((m) => (
          <tr key={m.id} className="border-t border-line">
            <td className="p-3">{m.name}</td>
            <td className="p-3 text-muted">{m.role_hr ?? "—"}</td>
            <td className="p-3 flex gap-3 justify-end">
              <Link href={`/admin/team/${m.id}/edit`} className="text-petrol hover:underline">
                Uredi
              </Link>
              <DeleteButton action={deleteTeamMember.bind(null, m.id)} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
