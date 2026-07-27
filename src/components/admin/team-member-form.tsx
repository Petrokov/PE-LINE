"use client";

import { useActionState } from "react";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import type { TeamMemberResult } from "@/lib/actions/team";
import type { TeamMember } from "@/lib/types";

const inputClass =
  "w-full border border-line rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-petrol transition-colors";
const labelClass = "block text-xs font-medium text-muted mb-1.5";

interface TeamMemberFormProps {
  action: (prev: TeamMemberResult | null, formData: FormData) => Promise<TeamMemberResult>;
  member?: TeamMember;
  submitLabel: string;
}

export function TeamMemberForm({ action, member, submitLabel }: TeamMemberFormProps) {
  const [state, formAction, pending] = useActionState<TeamMemberResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label className={labelClass}>Ime i prezime *</label>
        <input name="name" defaultValue={member?.name} required className={inputClass} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Uloga (HR)</label>
          <input name="role_hr" defaultValue={member?.role_hr ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Uloga (SL)</label>
          <input name="role_sl" defaultValue={member?.role_sl ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Uloga (EN)</label>
          <input name="role_en" defaultValue={member?.role_en ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Biografija (HR)</label>
        <textarea name="bio_hr" defaultValue={member?.bio_hr ?? ""} rows={3} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Redoslijed</label>
        <input name="sort_order" type="number" defaultValue={member?.sortOrder ?? 0} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Fotografija</label>
        <ImageDropzone name="photo_url" folder="team" defaultValue={member?.photoUrl} />
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
