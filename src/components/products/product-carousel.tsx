"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GAP = 20; // matches gap-5

/**
 * Card carousel: no scrollbar, the track slides one card at a time with the arrows,
 * the dots or a swipe. As many cards are visible as the card width classes allow.
 */
export function ProductCarousel({
  labelledBy,
  header,
  children,
}: {
  labelledBy: string;
  header: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations("products");
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const dragged = useRef(false);

  const measure = useCallback(() => {
    const v = viewport.current;
    const list = track.current;
    const card = list?.querySelector("li");
    if (!v || !list || !card) return;
    const cardStep = card.getBoundingClientRect().width + GAP;
    const visible = Math.max(1, Math.floor((v.clientWidth + GAP) / cardStep + 0.01));
    const max = Math.max(0, list.children.length - visible);
    setStep(cardStep);
    setMaxIndex(max);
    setIndex((i) => Math.min(i, max));
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [measure]);

  const go = (i: number) => setIndex(Math.max(0, Math.min(maxIndex, i)));

  // Swipe: follow the finger horizontally, snap to the nearest card on release.
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    start.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) < 8) return;
    if (!s.moved && Math.abs(e.clientY - s.y) > Math.abs(dx)) {
      start.current = null; // vertical scroll of the page, not a swipe
      return;
    }
    s.moved = true;
    setDrag(dx);
  };
  const onPointerUp = () => {
    const s = start.current;
    start.current = null;
    dragged.current = !!s?.moved;
    if (s?.moved && drag !== null && step > 0) {
      const cards = Math.round(-drag / step) || (Math.abs(drag) > 40 ? -Math.sign(drag) : 0);
      go(index + cards);
    }
    setDrag(null);
  };

  const offset = -index * step + (drag ?? 0);
  const button =
    "grid place-items-center size-10 rounded-full border border-line bg-white text-ink transition-opacity " +
    "hover:border-petrol/40 disabled:opacity-30 disabled:cursor-default";

  return (
    <div role="region" aria-roledescription="carousel" aria-labelledby={labelledBy}>
      <div className="flex items-end justify-between gap-6 mb-8">
        <div className="min-w-0">{header}</div>
        {maxIndex > 0 && (
          <div className="flex shrink-0 gap-2">
            <button type="button" className={button} onClick={() => go(index - 1)} disabled={index === 0} aria-label={t("railPrev")}>
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button type="button" className={button} onClick={() => go(index + 1)} disabled={index >= maxIndex} aria-label={t("railNext")}>
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      {/* Vertical padding keeps the cards' hover shadow from being clipped. */}
      <div
        ref={viewport}
        className="overflow-hidden -my-6 py-6 -mx-2 px-2"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          // A swipe that ends on a card must not open it.
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
            dragged.current = false;
          }
        }}
      >
        <ul
          ref={track}
          className="flex gap-5"
          style={{
            transform: `translate3d(${offset}px, 0, 0)`,
            transition: drag === null ? "transform 500ms cubic-bezier(0.32,0.72,0,1)" : "none",
          }}
        >
          {children}
        </ul>
      </div>

      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={t("railGoTo", { number: i + 1 })}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-petrol" : "w-1.5 bg-line-dark"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
