import { createGalleryImage } from "@/lib/actions/gallery";
import { GalleryImageForm } from "@/components/admin/gallery-image-form";

export default function NewGalleryImagePage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Nova slika</h1>
      <GalleryImageForm action={createGalleryImage} submitLabel="Spremi" />
    </div>
  );
}
