"use client";

import { useActionState } from "react";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import { updateSettings, type SettingsResult } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/types";

const inputClass =
  "w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors";
const labelClass = "block text-xs font-medium text-muted mb-1.5";

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, pending] = useActionState<SettingsResult | null, FormData>(
    updateSettings,
    null
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Naziv tvrtke</label>
          <input name="site_name" defaultValue={settings?.siteName ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telefon</label>
          <input name="phone" defaultValue={settings?.phone ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>E-mail</label>
          <input name="email" defaultValue={settings?.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Adresa</label>
          <input name="address" defaultValue={settings?.address ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Google Maps URL</label>
        <input name="map_url" defaultValue={settings?.mapUrl ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Facebook</label>
          <input name="facebook" defaultValue={settings?.facebook ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input name="instagram" defaultValue={settings?.instagram ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>LinkedIn</label>
          <input name="linkedin" defaultValue={settings?.linkedin ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>YouTube</label>
          <input name="youtube" defaultValue={settings?.youtube ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Podnožje tekst (HR)</label>
          <textarea name="footer_text_hr" defaultValue={settings?.footerText_hr ?? ""} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Podnožje tekst (SL)</label>
          <textarea name="footer_text_sl" defaultValue={settings?.footerText_sl ?? ""} rows={3} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Podnožje tekst (EN)</label>
          <textarea name="footer_text_en" defaultValue={settings?.footerText_en ?? ""} rows={3} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Logo</label>
        <ImageDropzone name="logo_url" folder="settings" defaultValue={settings?.logoUrl} />
      </div>

      <div>
        <label className={labelClass}>Hero slika</label>
        <ImageDropzone name="hero_image_url" folder="settings" defaultValue={settings?.heroImageUrl} />
      </div>

      {state && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-petrol text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Spremanje..." : "Spremi promjene"}
      </button>
    </form>
  );
}
