import { getAllCategories } from "@/lib/queries";
import { createDownload } from "@/lib/actions/downloads";
import { DownloadForm } from "@/components/admin/download-form";

export default async function NewDownloadPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Nova datoteka</h1>
      <DownloadForm action={createDownload} categories={categories} submitLabel="Spremi" />
    </div>
  );
}
