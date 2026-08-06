"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight, Package } from "lucide-react";

interface CategoryBentoCardProps {
  href: string;
  name: string;
  description?: string | null;
  imageSrc?: string;
  isFeature: boolean;
  exploreLabel: string;
}

export function CategoryBentoCard({
  href,
  name,
  description,
  imageSrc,
  isFeature,
  exploreLabel,
}: CategoryBentoCardProps) {
  return (
    <Link href={href} className="group block h-full">
      {/* Outer shell — double bezel */}
      <div
        className="rounded-[2rem] p-[6px] border h-full transition-all duration-500"
        style={{
          background: "rgba(232,226,216,0.35)",
          borderColor: "rgba(216,221,225,0.75)",
          boxShadow: "0 8px 32px rgba(29,35,41,0.05)",
          transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(14,79,95,0.35)";
          el.style.boxShadow = "0 28px 80px rgba(29,35,41,0.12)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(216,221,225,0.75)";
          el.style.boxShadow = "0 8px 32px rgba(29,35,41,0.05)";
        }}
      >
        {/* Inner core */}
        <div
          className="rounded-[calc(2rem-0.375rem)] bg-white overflow-hidden h-full flex flex-col"
          style={{
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.95)",
            minHeight: isFeature ? "340px" : "300px",
          }}
        >
          <div
            className="relative bg-bg-secondary overflow-hidden flex-shrink-0"
            style={{ aspectRatio: isFeature ? "16/7" : "4/3" }}
          >
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-700"
                style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")
                }
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package size={isFeature ? 56 : 40} strokeWidth={0.8} className="text-line" />
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col flex-1">
            <h2
              className={`font-bold text-ink leading-snug mb-2 tracking-tight ${
                isFeature ? "text-xl" : "text-base"
              }`}
            >
              {name}
            </h2>
            {description && (
              <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4 flex-1">
                {description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-sm font-semibold text-petrol transition-colors duration-300 group-hover:text-cyan-light">
                {exploreLabel}
              </span>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500"
                style={{ background: "rgba(14,79,95,0.08)" }}
              >
                <ArrowRight size={12} strokeWidth={1.5} className="text-petrol transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
