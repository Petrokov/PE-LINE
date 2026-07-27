"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowUp, ArrowDown, X } from "lucide-react";

interface MultiImageDropzoneProps {
  name: string;
  folder: string;
  defaultValue?: string[];
}

export function MultiImageDropzone({ name, folder, defaultValue = [] }: MultiImageDropzoneProps) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (files: FileList) => {
      setUploading(true);
      setError(null);
      const supabase = createClient();
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          setError("Greška pri prijenosu jedne ili više datoteka.");
          continue;
        }

        const { data } = supabase.storage.from("media").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      setUrls((prev) => [...prev, ...newUrls]);
      setUploading(false);
    },
    [folder]
  );

  function remove(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    setUrls((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {urls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {urls.map((url, i) => (
            <div key={url} className="relative border border-line rounded-[8px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-20 object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-white disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === urls.length - 1}
                  className="text-white disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-line rounded-[8px] p-4 text-center cursor-pointer hover:border-petrol transition-colors"
      >
        <p className="text-sm text-muted">
          {uploading ? "Prijenos..." : "Povuci slike ovdje ili klikni za odabir"}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) upload(e.target.files);
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
