"use client";

import { useActionState } from "react";
import { MultiImageDropzone } from "@/components/admin/multi-image-dropzone";
import { SpecsEditor } from "@/components/admin/specs-editor";
import type { ProductResult } from "@/lib/actions/products";
import type { Category, Product } from "@/lib/types";

const inputClass =
  "w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors";
const labelClass = "block text-xs font-medium text-muted mb-1.5";

interface ProductFormProps {
  action: (prev: ProductResult | null, formData: FormData) => Promise<ProductResult>;
  product?: Product;
  categories: Category[];
  submitLabel: string;
}

export function ProductForm({ action, product, categories, submitLabel }: ProductFormProps) {
  const [state, formAction, pending] = useActionState<ProductResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Naziv (HR) *</label>
          <input name="name_hr" defaultValue={product?.name_hr} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Naziv (SL)</label>
          <input name="name_sl" defaultValue={product?.name_sl ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Naziv (EN)</label>
          <input name="name_en" defaultValue={product?.name_en ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug</label>
          <input name="slug" defaultValue={product?.slug ?? ""} placeholder="ostavi prazno za automatski" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Kategorija *</label>
          <select name="category_id" defaultValue={product?.categoryId ?? ""} required className={inputClass}>
            <option value="" disabled>
              — Odaberi kategoriju —
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_hr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Opis (HR)</label>
          <textarea name="description_hr" defaultValue={product?.description_hr ?? ""} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Opis (SL)</label>
          <textarea name="description_sl" defaultValue={product?.description_sl ?? ""} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Opis (EN)</label>
          <textarea name="description_en" defaultValue={product?.description_en ?? ""} rows={3} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={labelClass}>Raspon cijena</label>
          <input name="price_range" defaultValue={product?.price_range ?? ""} placeholder="npr. 120 - 180 EUR" className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink pb-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} />
          Istaknuti proizvod
        </label>
      </div>

      <div>
        <label className={labelClass}>Slike</label>
        <MultiImageDropzone name="images" folder="products" defaultValue={product?.images ?? []} />
      </div>

      <div>
        <label className={labelClass}>Specifikacije</label>
        <SpecsEditor name="specs" defaultValue={product?.specs ?? []} />
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
