import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateGalleryImage } from "@/lib/actions/gallery";
import { GalleryImageForm } from "@/components/admin/gallery-image-form";
import type { GalleryImage } from "@/lib/types";

export default async function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("gallery_images")
    .select("id, imageUrl:image_url, alt_hr, caption_hr, sortOrder:sort_order")
    .eq("id", id)
    .maybeSingle();

  if (!image) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Uredi sliku</h1>
      <GalleryImageForm
        action={updateGalleryImage.bind(null, id)}
        image={image as unknown as GalleryImage}
        submitLabel="Spremi promjene"
      />
    </div>
  );
}
