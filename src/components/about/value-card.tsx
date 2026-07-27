"use client";

import type { ReactNode } from "react";

type Variant = "petrol" | "ink" | "light" | "cyan";

const variantClasses: Record<Variant, string> = {
  petrol: "bg-gradient-to-br from-petrol to-petrol-dark text-white",
  ink: "bg-ink text-white/85",
  light: "bg-bg-secondary text-ink",
  cyan: "bg-gradient-to-br from-cyan to-petrol-light text-white",
};

const titleClasses: Record<Variant, string> = {
  petrol: "text-white",
  ink: "text-white",
  light: "text-ink",
  cyan: "text-white",
};

interface ValueCardProps {
  decoIcon: ReactNode;
  title: string;
  text: string;
  variant: Variant;
}

export function ValueCard({ decoIcon, title, text, variant }: ValueCardProps) {
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mx", `${x}%`);
    e.currentTarget.style.setProperty("--my", `${y}%`);
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className={`spotlight-card group relative flex flex-col justify-between min-h-[220px] p-7 md:p-8 overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-[0_20px_50px_rgba(29,35,41,0.10)] hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(29,35,41,0.18)] transition-all duration-300 ${variantClasses[variant]}`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <h3 className={`text-xl font-bold tracking-tight ${titleClasses[variant]}`}>{title}</h3>
        <p className="mt-2 text-sm leading-relaxed opacity-80 max-w-[90%]">{text}</p>
      </div>

      <div className="absolute -right-6 -bottom-6 opacity-[0.14] pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
        {decoIcon}
      </div>
    </div>
  );
}
