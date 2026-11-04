"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horizontal row of cards on every screen size, with arrow buttons when it overflows. */
export function ProductRail({
  labelledBy,
  header,
  children,
}: {
  labelledBy: string;
  header: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations("products");
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const button =
    "grid place-items-center size-10 rounded-full border border-line bg-white text-ink transition-opacity " +
    "hover:border-petrol/40 disabled:opacity-30 disabled:cursor-default";

  return (
    <div>
      <div className="flex items-end justify-between gap-6 mb-8">
        <div className="min-w-0">{header}</div>
        {!(edges.start && edges.end) && (
          <div className="hidden sm:flex shrink-0 gap-2">
            <button type="button" className={button} onClick={() => scroll(-1)} disabled={edges.start} aria-label={t("railPrev")}>
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button type="button" className={button} onClick={() => scroll(1)} disabled={edges.end} aria-label={t("railNext")}>
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
      <ul
        ref={ref}
        aria-labelledby={labelledBy}
        className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </ul>
    </div>
  );
}
