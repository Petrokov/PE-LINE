import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteGalleryImage } from "@/lib/actions/gallery";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function GalleryListPage() {
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("gallery_images")
    .select("id, imageUrl:image_url, caption_hr")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink">Galerija</h1>
        <Link
          href="/admin/gallery/new"
          className="bg-petrol text-white rounded-[10px] px-4 py-2 text-sm font-semibold"
        >
          + Nova slika
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {(images ?? []).map((img) => (
          <div key={img.id} className="bg-white border border-line rounded-[10px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.imageUrl} alt="" className="w-full h-32 object-cover" />
            <div className="p-3">
              {img.caption_hr && <p className="text-xs text-muted mb-2 truncate">{img.caption_hr}</p>}
              <div className="flex gap-3">
                <Link href={`/admin/gallery/${img.id}/edit`} className="text-sm text-petrol hover:underline">
                  Uredi
                </Link>
                <DeleteButton action={deleteGalleryImage.bind(null, img.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
