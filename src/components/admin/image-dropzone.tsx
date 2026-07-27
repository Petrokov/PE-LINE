"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageDropzoneProps {
  name: string;
  folder: string;
  defaultValue?: string | null;
  accept?: string;
}

export function ImageDropzone({
  name,
  folder,
  defaultValue,
  accept = "image/*",
}: ImageDropzoneProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("Greška pri prijenosu datoteke.");
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      setUrl(data.publicUrl);
      setUploading(false);
    },
    [folder]
  );

  const isImage = accept.includes("image");

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-line rounded-[8px] p-6 text-center cursor-pointer hover:border-petrol transition-colors"
      >
        {url ? (
          isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="mx-auto max-h-40 object-contain" />
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-petrol underline break-all"
            >
              {url.split("/").pop()}
            </a>
          )
        ) : (
          <p className="text-sm text-muted">
            {uploading ? "Prijenos..." : "Povuci datoteku ovdje ili klikni za odabir"}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
