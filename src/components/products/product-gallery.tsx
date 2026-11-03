"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { productThumbUrl } from "@/lib/product-images";

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const t = useTranslations("products");
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const hasMany = count > 1;
  const go = (index: number) => setActive((index + count) % count);

  // Restarts on every image change, so manual navigation also resets the countdown.
  useEffect(() => {
    if (!hasMany || paused || reduceMotion) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, hasMany, paused, reduceMotion, count]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!hasMany) return;
    if (e.key === "ArrowLeft") go(active - 1);
    if (e.key === "ArrowRight") go(active + 1);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
    go(dx < 0 ? active + 1 : active - 1);
  }

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Main image */}
      <div
        // White behind photos: product shots are cut out on white and shown whole, not cropped.
        className={`relative overflow-hidden ${count > 0 ? "bg-white border border-line" : "bg-bg-secondary"}`}
        style={{ borderRadius: "16px", aspectRatio: "4/3" }}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        {count > 0 ? (
          <div aria-live={hasMany && !paused ? "off" : "polite"}>
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src + i}
                src={src}
                alt={i === active ? name : ""}
                aria-hidden={i !== active}
                className="absolute inset-0 w-full h-full object-contain p-6"
                style={{
                  opacity: i === active ? 1 : 0,
                  transition: reduceMotion ? "none" : "opacity 600ms cubic-bezier(0.32,0.72,0,1)",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted/50 text-sm">{t("noPhoto")}</p>
          </div>
        )}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label={t("prevImage")}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 border border-line text-ink shadow-sm transition-colors hover:bg-white hover:text-petrol focus-visible:outline-2 focus-visible:outline-petrol"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label={t("nextImage")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 border border-line text-ink shadow-sm transition-colors hover:bg-white hover:text-petrol focus-visible:outline-2 focus-visible:outline-petrol"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </>
        )}

        {/* Brand mark */}
        <div
          className="absolute bottom-3 left-3 rounded-full px-3 py-2 bg-white/85 border border-line/70 shadow-sm backdrop-blur-sm pointer-events-none"
        >
          <Image
            src="/images/categories/header/PE-LINE-logo.png"
            alt="PE-LINE"
            width={776}
            height={92}
            className="block w-auto"
            style={{ height: "14px" }}
          />
        </div>
      </div>

      {/* Thumbnails */}
      {hasMany && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => go(i)}
              aria-label={t("showImage", { number: i + 1 })}
              aria-current={i === active}
              className={`shrink-0 w-24 overflow-hidden bg-white transition-[border-color,opacity] focus-visible:outline-2 focus-visible:outline-petrol ${
                i === active ? "border-2 border-petrol" : "border border-line opacity-70 hover:opacity-100"
              }`}
              style={{ borderRadius: "10px", aspectRatio: "4/3" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productThumbUrl(src)} alt="" className="w-full h-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
