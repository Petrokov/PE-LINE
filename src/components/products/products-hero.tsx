"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@/lib/navigation";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import type { Category, Locale } from "@/lib/types";
import { localized } from "@/lib/types";

const EASE = [0.32, 0.72, 0, 1] as const;

const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  "podno-grijanje": "/images/categories/podno-grijanje.jpg",
  "radijatori": "/images/categories/radijatori.jpg",
  "ventilokonvektori": "/images/categories/ventilokonvektori.jpg",
  "spremnici": "/images/categories/spremnici.jpg",
  "dimovodi": "/images/categories/dimovodi.jpg",
  "regulacije": "/images/categories/regulacije.jpg",
  "ormarici": "/images/categories/ormarcici.jpg",
};

const HERO_FALLBACK = "/images/categories/grijanje-i-hladenje.jpg";

function categoryImage(category: Category): string | undefined {
  return category.heroImageUrl ?? FALLBACK_IMAGE_BY_SLUG[category.slug];
}

function categoryDescription(category: Category, locale: Locale): string | null | undefined {
  if (locale === "sl") return category.description_sl;
  if (locale === "en") return category.description_en;
  return category.description_hr;
}

interface ProductsHeroProps {
  categories: Category[];
  locale: Locale;
  subtitle: string;
  exploreLabel: string;
}

export function ProductsHero({
  categories,
  locale,
  subtitle,
  exploreLabel,
}: ProductsHeroProps) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const momentumFrame = useRef<number | null>(null);

  const drag = useRef({
    isDragging: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });

  const activeCategory = categories[active];
  const activeName = activeCategory ? localized(activeCategory, locale) : "";
  const activeDescription = activeCategory ? categoryDescription(activeCategory, locale) : undefined;
  const activeImage = activeCategory ? categoryImage(activeCategory) : HERO_FALLBACK;

  const cardTargetLeft = useCallback((i: number) => {
    const el = scrollerRef.current;
    const card = cardRefs.current[i];
    if (!el || !card) return null;
    const max = el.scrollWidth - el.clientWidth;
    const target = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
    return Math.max(0, Math.min(max, target));
  }, []);

  const scrollToIndex = useCallback(
    (i: number) => {
      const el = scrollerRef.current;
      const left = cardTargetLeft(i);
      if (!el || left === null) return;
      el.scrollTo({ left, behavior: "smooth" });
    },
    [cardTargetLeft]
  );

  const nearestIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return active;
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }, [active]);

  function goTo(i: number) {
    const next = (i + categories.length) % categories.length;
    setActive(next);
    scrollToIndex(next);
  }

  function stopMomentum() {
    if (momentumFrame.current !== null) {
      cancelAnimationFrame(momentumFrame.current);
      momentumFrame.current = null;
    }
  }

  function settleToNearest() {
    const i = nearestIndex();
    setActive(i);
    scrollToIndex(i);
  }

  function runMomentum(velocity: number) {
    const el = scrollerRef.current;
    if (!el) return;
    let v = velocity;
    const friction = 0.94;

    const step = () => {
      const elCur = scrollerRef.current;
      if (!elCur) return;
      v *= friction;
      elCur.scrollLeft -= v;

      const max = elCur.scrollWidth - elCur.clientWidth;
      const outOfBounds = elCur.scrollLeft <= 0 || elCur.scrollLeft >= max;

      if (Math.abs(v) < 0.4 || outOfBounds) {
        momentumFrame.current = null;
        settleToNearest();
        return;
      }
      momentumFrame.current = requestAnimationFrame(step);
    };

    momentumFrame.current = requestAnimationFrame(step);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el) return;
    stopMomentum();
    drag.current = {
      isDragging: true,
      moved: false,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (!el || !drag.current.isDragging) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScrollLeft - delta;

    const now = performance.now();
    const dt = now - drag.current.lastT;
    if (dt > 0) {
      drag.current.velocity = ((e.clientX - drag.current.lastX) / dt) * 16;
    }
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const el = scrollerRef.current;
    if (el) el.releasePointerCapture(e.pointerId);
    if (!drag.current.isDragging) return;
    drag.current.isDragging = false;

    if (Math.abs(drag.current.velocity) > 1) {
      runMomentum(drag.current.velocity);
    } else {
      settleToNearest();
    }
  }

  useEffect(() => stopMomentum, []);

  useEffect(() => {
    const el = scrollerRef.current;
    const left = cardTargetLeft(active);
    if (!el || left === null) return;
    el.scrollTo({ left, behavior: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nameWords = activeName.split(" ");
  const midpoint = Math.ceil(nameWords.length / 2);
  const nameLine1 = nameWords.slice(0, midpoint).join(" ");
  const nameLine2 = nameWords.slice(midpoint).join(" ");

  return (
    <section className="relative h-[76dvh] min-h-[560px] w-full overflow-hidden bg-petrol-dark">
      {/* Background photo — crossfades on category change */}
      <AnimatePresence mode="sync">
        <motion.div
          key={activeCategory?.id ?? "fallback"}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Image
            src={activeImage ?? HERO_FALLBACK}
            alt={activeName}
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Legibility gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,58,71,0.90) 0%, rgba(10,58,71,0.48) 42%, rgba(10,58,71,0.06) 68%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(10,58,71,0.38) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 h-full flex flex-col justify-end pb-10 md:pb-14">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            {/* Left: title block — crossfades text on category change */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-px bg-white/50" />
                <span className="text-white/70 text-xs uppercase tracking-[0.2em] font-medium">
                  {subtitle}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory?.id ?? "fallback"}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <h1
                    className="font-black text-white tracking-[-0.03em] leading-[0.98] mb-4"
                    style={{ fontSize: "clamp(2.4rem, 5.4vw, 4.4rem)" }}
                  >
                    {nameLine1}
                    {nameLine2 && (
                      <>
                        <br />
                        {nameLine2}
                      </>
                    )}
                  </h1>

                  {activeDescription && (
                    <p className="text-white/75 text-sm md:text-base leading-relaxed mb-6 max-w-md">
                      {activeDescription}
                    </p>
                  )}

                  <Link
                    href={activeCategory ? `/proizvodi/${activeCategory.slug}` : "/proizvodi"}
                    className="inline-flex items-center gap-2.5 rounded-full pl-2 pr-5 py-2 text-sm font-semibold text-white"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="w-7 h-7 rounded-full bg-champagne flex items-center justify-center shrink-0">
                      <Bookmark size={13} strokeWidth={2} className="text-ink" />
                    </span>
                    {exploreLabel} {activeName}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: category card strip */}
            <div className="flex-1 lg:max-w-[52%]">
              <div
                ref={scrollerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                className="relative flex gap-3 overflow-x-auto scrollbar-hide pb-1 cursor-grab active:cursor-grabbing select-none"
              >
                {/* Spacer — lets the first card reach true center */}
                <div className="shrink-0" style={{ width: "calc(50% - 75px)" }} aria-hidden="true" />

                {categories.map((category, i) => {
                  const name = localized(category, locale);
                  const image = categoryImage(category);

                  return (
                    <button
                      key={category.id}
                      ref={(el) => {
                        cardRefs.current[i] = el;
                      }}
                      onClick={() => {
                        if (drag.current.moved) return;
                        goTo(i);
                      }}
                      className="relative shrink-0 overflow-hidden rounded-2xl cursor-pointer"
                      style={{
                        width: "150px",
                        height: "190px",
                        outline: i === active ? "2px solid white" : "2px solid transparent",
                        outlineOffset: "2px",
                        transition: "outline-color 250ms",
                      }}
                    >
                      {image && (
                        <Image
                          src={image}
                          alt={name}
                          fill
                          priority={i < 3}
                          className="object-cover transition-transform duration-500"
                          style={{ transform: i === active ? "scale(1.06)" : "scale(1)" }}
                          sizes="150px"
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                        <p className="text-white text-sm font-bold leading-tight">
                          {name}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Spacer — lets the last card reach true center */}
                <div className="shrink-0" style={{ width: "calc(50% - 75px)" }} aria-hidden="true" />
              </div>

              {/* Arrows + counter */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => goTo(active - 1)}
                  aria-label="Prethodna kategorija"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.35)" }}
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => goTo(active + 1)}
                  aria-label="Sljedeća kategorija"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.35)" }}
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative page counter — bottom-right corner */}
      <div
        className="absolute bottom-4 right-5 z-10 font-black text-white select-none pointer-events-none"
        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", opacity: 0.5, lineHeight: 1 }}
      >
        0{active + 1}
      </div>
    </section>
  );
}
