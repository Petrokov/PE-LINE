import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories } from "@/lib/queries";
import { updateDownload } from "@/lib/actions/downloads";
import { DownloadForm } from "@/components/admin/download-form";
import type { Download } from "@/lib/types";

export default async function EditDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: download }, categories] = await Promise.all([
    supabase
      .from("downloads")
      .select(
        "id, name_hr, name_sl, name_en, fileUrl:file_url, language, sortOrder:sort_order, " +
          "category:categories(id, name_hr, name_sl, name_en)"
      )
      .eq("id", id)
      .maybeSingle(),
    getAllCategories(),
  ]);

  if (!download) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Uredi datoteku</h1>
      <DownloadForm
        action={updateDownload.bind(null, id)}
        download={download as unknown as Download}
        categories={categories}
        submitLabel="Spremi promjene"
      />
    </div>
  );
}
