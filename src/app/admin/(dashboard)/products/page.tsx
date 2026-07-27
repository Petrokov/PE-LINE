import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/lib/actions/products";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminTable } from "@/components/admin/admin-table";

export default async function ProductsListPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name_hr, featured, category:categories(name_hr)")
    .order("name_hr", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Proizvodi</h1>
        <Link
          href="/admin/products/new"
          className="bg-petrol text-white rounded-[10px] px-4 py-2 text-sm font-semibold"
        >
          + Novi proizvod
        </Link>
      </div>

      <AdminTable headers={["Naziv", "Kategorija", "Istaknuto", ""]}>
        {(products ?? []).map((p) => (
          <tr key={p.id} className="border-t border-line">
            <td className="p-3">{p.name_hr}</td>
            <td className="p-3 text-muted">
              {(p.category as unknown as { name_hr: string } | null)?.name_hr ?? "—"}
            </td>
            <td className="p-3 text-center">{p.featured ? "Da" : "—"}</td>
            <td className="p-3 flex gap-3 justify-end">
              <Link href={`/admin/products/${p.id}/edit`} className="text-petrol hover:underline">
                Uredi
              </Link>
              <DeleteButton action={deleteProduct.bind(null, p.id)} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
