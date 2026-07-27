"use client";

import { useActionState } from "react";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import type { DownloadResult } from "@/lib/actions/downloads";
import type { Category, Download } from "@/lib/types";

const inputClass =
  "w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors";
const labelClass = "block text-xs font-medium text-muted mb-1.5";

interface DownloadFormProps {
  action: (prev: DownloadResult | null, formData: FormData) => Promise<DownloadResult>;
  download?: Download;
  categories: Category[];
  submitLabel: string;
}

export function DownloadForm({ action, download, categories, submitLabel }: DownloadFormProps) {
  const [state, formAction, pending] = useActionState<DownloadResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Naziv (HR) *</label>
          <input name="name_hr" defaultValue={download?.name_hr} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Naziv (SL)</label>
          <input name="name_sl" defaultValue={download?.name_sl ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Naziv (EN)</label>
          <input name="name_en" defaultValue={download?.name_en ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Jezik</label>
          <select name="language" defaultValue={download?.language ?? "all"} className={inputClass}>
            <option value="all">Sve</option>
            <option value="hr">HR</option>
            <option value="sl">SL</option>
            <option value="en">EN</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Kategorija</label>
          <select name="category_id" defaultValue={download?.category?.id ?? ""} className={inputClass}>
            <option value="">— Bez kategorije —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_hr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Redoslijed</label>
        <input name="sort_order" type="number" defaultValue={download?.sortOrder ?? 0} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Datoteka (PDF) *</label>
        <ImageDropzone
          name="file_url"
          folder="downloads"
          defaultValue={download?.fileUrl}
          accept=".pdf,application/pdf"
        />
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
