"use client";

import { useActionState } from "react";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import type { CategoryResult } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

const inputClass =
  "w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors";
const labelClass = "block text-xs font-medium text-muted mb-1.5";

interface CategoryFormProps {
  action: (prev: CategoryResult | null, formData: FormData) => Promise<CategoryResult>;
  category?: Category;
  topLevelCategories: Category[];
  submitLabel: string;
}

export function CategoryForm({ action, category, topLevelCategories, submitLabel }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState<CategoryResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Naziv (HR) *</label>
          <input name="name_hr" defaultValue={category?.name_hr} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Naziv (SL)</label>
          <input name="name_sl" defaultValue={category?.name_sl ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Naziv (EN)</label>
          <input name="name_en" defaultValue={category?.name_en ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Slug</label>
        <input name="slug" defaultValue={category?.slug ?? ""} placeholder="ostavi prazno za automatski" className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Opis (HR)</label>
          <textarea name="description_hr" defaultValue={category?.description_hr ?? ""} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Opis (SL)</label>
          <textarea name="description_sl" defaultValue={category?.description_sl ?? ""} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Opis (EN)</label>
          <textarea name="description_en" defaultValue={category?.description_en ?? ""} rows={3} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Ikona (Lucide naziv)</label>
          <input name="icon" defaultValue={category?.icon ?? ""} placeholder="npr. Flame" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Redoslijed</label>
          <input name="sort_order" type="number" defaultValue={category?.sortOrder ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nadkategorija</label>
          <select name="parent_id" defaultValue={category?.parentId ?? ""} className={inputClass}>
            <option value="">— Nema (glavna kategorija) —</option>
            {topLevelCategories
              .filter((c) => c.id !== category?.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_hr}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Slika (hero)</label>
        <ImageDropzone name="hero_image_url" folder="categories" defaultValue={category?.heroImageUrl} />
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
