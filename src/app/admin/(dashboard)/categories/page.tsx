import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/lib/actions/categories";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminTable } from "@/components/admin/admin-table";

export default async function CategoriesListPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_hr, slug, parent_id, sort_order, parent:categories!categories_parent_id_fkey(name_hr)")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Kategorije</h1>
        <Link
          href="/admin/categories/new"
          className="bg-petrol text-white rounded-[10px] px-4 py-2 text-sm font-semibold"
        >
          + Nova kategorija
        </Link>
      </div>

      <AdminTable headers={["Naziv", "Slug", "Nadkategorija", ""]}>
        {(categories ?? []).map((c) => (
          <tr key={c.id} className="border-t border-line">
            <td className="p-3">{c.name_hr}</td>
            <td className="p-3 text-muted">{c.slug}</td>
            <td className="p-3 text-muted">
              {(c.parent as unknown as { name_hr: string } | null)?.name_hr ?? "—"}
            </td>
            <td className="p-3 flex gap-3 justify-end">
              <Link href={`/admin/categories/${c.id}/edit`} className="text-petrol hover:underline">
                Uredi
              </Link>
              <DeleteButton action={deleteCategory.bind(null, c.id)} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
