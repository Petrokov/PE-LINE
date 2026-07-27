"use client";

import { useActionState } from "react";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import type { GalleryImageResult } from "@/lib/actions/gallery";
import type { GalleryImage } from "@/lib/types";

const inputClass =
  "w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors";
const labelClass = "block text-xs font-medium text-muted mb-1.5";

interface GalleryImageFormProps {
  action: (prev: GalleryImageResult | null, formData: FormData) => Promise<GalleryImageResult>;
  image?: GalleryImage;
  submitLabel: string;
}

export function GalleryImageForm({ action, image, submitLabel }: GalleryImageFormProps) {
  const [state, formAction, pending] = useActionState<GalleryImageResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label className={labelClass}>Slika *</label>
        <ImageDropzone name="image_url" folder="gallery" defaultValue={image?.imageUrl} />
      </div>

      <div>
        <label className={labelClass}>Alt tekst (HR)</label>
        <input name="alt_hr" defaultValue={image?.alt_hr ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Opis (HR)</label>
        <input name="caption_hr" defaultValue={image?.caption_hr ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Redoslijed</label>
        <input name="sort_order" type="number" defaultValue={image?.sortOrder ?? 0} className={inputClass} />
      </div>

      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-petrol text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Spremanje..." : submitLabel}
      </button>
    </form>
  );
}
