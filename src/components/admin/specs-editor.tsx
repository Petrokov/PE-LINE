"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface SpecsEditorProps {
  name: string;
  defaultValue?: Array<{ key: string; value: string }>;
}

export function SpecsEditor({ name, defaultValue = [] }: SpecsEditorProps) {
  const [specs, setSpecs] = useState(defaultValue.length > 0 ? defaultValue : []);

  function update(index: number, field: "key" | "value", value: string) {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function add() {
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  }

  function remove(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(specs)} />
      <div className="space-y-2">
        {specs.map((spec, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={spec.key}
              onChange={(e) => update(i, "key", e.target.value)}
              placeholder="Naziv"
              className="flex-1 border border-line rounded-[8px] px-3 py-1.5 text-sm focus:outline-none focus:border-petrol"
            />
            <input
              value={spec.value}
              onChange={(e) => update(i, "value", e.target.value)}
              placeholder="Vrijednost"
              className="flex-1 border border-line rounded-[8px] px-3 py-1.5 text-sm focus:outline-none focus:border-petrol"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted hover:text-red-600 cursor-pointer px-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 flex items-center gap-1 text-sm text-petrol hover:underline cursor-pointer"
      >
        <Plus size={14} /> Dodaj specifikaciju
      </button>
    </div>
  );
}
