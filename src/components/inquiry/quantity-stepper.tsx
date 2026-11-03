"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { MAX_QTY, MIN_QTY, clampQty } from "@/lib/inquiry-list";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  /** Product name, so the icon buttons announce what they change. */
  itemLabel: string;
  className?: string;
}

export function QuantityStepper({ value, onChange, itemLabel, className = "h-10" }: QuantityStepperProps) {
  const t = useTranslations("inquiry");

  const step = (delta: number) => {
    const next = clampQty(value + delta);
    if (next !== value) onChange(next);
  };

  const buttonClass =
    "grid h-full w-10 shrink-0 place-items-center text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:text-line cursor-pointer";

  return (
    <div
      role="group"
      aria-label={t("quantityFor", { name: itemLabel })}
      className={`inline-flex shrink-0 items-center overflow-hidden rounded-full border border-line bg-white ${className}`}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={value <= MIN_QTY}
        aria-label={t("decrease", { name: itemLabel })}
        className={buttonClass}
      >
        <Minus size={15} strokeWidth={1.5} />
      </button>
      <span
        aria-live="polite"
        className="flex h-full w-9 items-center justify-center border-x border-line text-sm font-semibold tabular-nums text-ink"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={value >= MAX_QTY}
        aria-label={t("increase", { name: itemLabel })}
        className={buttonClass}
      >
        <Plus size={15} strokeWidth={1.5} />
      </button>
    </div>
  );
}
