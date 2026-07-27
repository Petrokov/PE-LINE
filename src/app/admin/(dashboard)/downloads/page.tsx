import Link from "next/link";
import { getDownloads } from "@/lib/queries";
import { deleteDownload } from "@/lib/actions/downloads";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminTable } from "@/components/admin/admin-table";

export default async function DownloadsListPage() {
  const downloads = await getDownloads();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Preuzimanja</h1>
        <Link
          href="/admin/downloads/new"
          className="bg-petrol text-white rounded-[10px] px-4 py-2 text-sm font-semibold"
        >
          + Nova datoteka
        </Link>
      </div>

      <AdminTable headers={["Naziv", "Jezik", "Kategorija", ""]}>
        {downloads.map((d) => (
          <tr key={d.id} className="border-t border-line">
            <td className="p-3">{d.name_hr}</td>
            <td className="p-3 text-muted uppercase">{d.language}</td>
            <td className="p-3 text-muted">{d.category?.name_hr ?? "—"}</td>
            <td className="p-3 flex gap-3 justify-end">
              <Link href={`/admin/downloads/${d.id}/edit`} className="text-petrol hover:underline">
                Uredi
              </Link>
              <DeleteButton action={deleteDownload.bind(null, d.id)} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
