"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, Package } from "lucide-react";
import type { Category, Locale, Product } from "@/lib/types";
import { localized } from "@/lib/types";
import type { CategoryPreview } from "@/lib/queries";
import { productThumbUrl } from "@/lib/product-images";

const EASE = [0.32, 0.72, 0, 1] as const;

const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  "podno-grijanje": "/images/categories/podno-grijanje.jpg",
  "radijatori": "/images/categories/radijatori.jpg",
  "ventilokonvektori": "/images/categories/ventilokonvektori.jpg",
  "spremnici": "/images/categories/spremnici.jpg",
  "dimovodi": "/images/categories/dimovodi.jpg",
  "regulacije": "/images/categories/regulacije.jpg",
  "ormarici": "/images/categories/ormarcici.jpg",
  "bojleri": "/images/categories/bojleri.jpg",
  "instalacije": "/images/categories/instalacije.jpg",
};

const HERO_FALLBACK = "/images/categories/grijanje-i-hladenje.jpg";

/** Radius of the panel, its notch and the concave corners joining them. */
const RADIUS = 28;

function categoryImage(category: Category): string {
  return category.heroImageUrl ?? FALLBACK_IMAGE_BY_SLUG[category.slug] ?? HERO_FALLBACK;
}

function categoryDescription(category: Category, locale: Locale): string | null | undefined {
  if (locale === "sl") return category.description_sl || category.description_hr;
  if (locale === "en") return category.description_en || category.description_hr;
  return category.description_hr;
}

function catalogueNumber(product: Product): string | undefined {
  return product.specs?.find((spec) => spec.key === "Kataloški broj")?.value;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Background-coloured quarter that turns the notch's outer corner concave. */
function ConcaveCorner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`hidden lg:block absolute pointer-events-none ${className}`}
      style={{
        width: RADIUS,
        height: RADIUS,
        background: `radial-gradient(circle at 100% 100%, transparent ${RADIUS - 0.5}px, var(--color-bg) ${RADIUS}px)`,
      }}
    />
  );
}

interface ProductsHeroProps {
  categories: Category[];
  previews: Record<string, CategoryPreview>;
  locale: Locale;
}

/**
 * Category carousel at the top of the products page: a photo panel with a
 * notch for the title, a description card bottom-left and a few of the
 * category's products bottom-right.
 *
 * Every slide's text is rendered on the server and stacked in one grid cell,
 * so all category names, descriptions and product links are in the HTML for
 * search engines; only the active slide is visible and reachable.
 */
export function ProductsHero({ categories, previews, locale }: ProductsHeroProps) {
  const t = useTranslations("products");
  const [active, setActive] = useState(0);
  const swipeStart = useRef<number | null>(null);

  const activeCategory = categories[active];
  const count = categories.length;

  function goTo(i: number) {
    setActive((i + count) % count);
  }

  /** Renders one region per category, stacked so the region is as tall as its tallest slide. */
  function stacked(render: (category: Category, i: number) => React.ReactNode, className = "") {
    return (
      <div className={`grid ${className}`}>
        {categories.map((category, i) => {
          const isActive = i === active;
          return (
            <div
              key={category.id}
              aria-hidden={!isActive}
              inert={!isActive}
              className="[grid-area:1/1] min-w-0"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? "translateY(0)" : "translateY(10px)",
                pointerEvents: isActive ? "auto" : "none",
                transition: "opacity 420ms cubic-bezier(0.32,0.72,0,1), transform 420ms cubic-bezier(0.32,0.72,0,1)",
                // The incoming slide waits for the outgoing one to fade, so their texts never overlap.
                transitionDelay: isActive ? "160ms" : "0ms",
              }}
            >
              {render(category, i)}
            </div>
          );
        })}
      </div>
    );
  }

  const controls = (
    <div
      className="flex items-center gap-1.5 rounded-full p-1.5"
      style={{
        background: "rgba(253,251,247,0.88)",
        border: "1px solid rgba(216,221,225,0.8)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
      }}
    >
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        aria-label={t("prevCategory")}
        className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors cursor-pointer"
      >
        <ChevronLeft size={15} strokeWidth={1.75} />
      </button>
      <div className="hidden sm:flex items-center gap-1.5 px-1">
        {categories.map((category, i) => (
          <button
            key={category.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={t("showCategory", { name: localized(category, locale) })}
            aria-current={i === active ? "true" : undefined}
            className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: i === active ? 18 : 6,
              background: i === active ? "var(--color-petrol)" : "var(--color-line-dark)",
            }}
          />
        ))}
      </div>
      <span className="sm:hidden px-1 font-spec text-xs tabular-nums text-ink">
        {pad(active + 1)} / {pad(count)}
      </span>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        aria-label={t("nextCategory")}
        className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors cursor-pointer"
      >
        <ChevronRight size={15} strokeWidth={1.75} />
      </button>
    </div>
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("heroLabel")}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") goTo(active - 1);
        if (e.key === "ArrowRight") goTo(active + 1);
      }}
      className="bg-bg pt-28 lg:pt-32 pb-6 lg:h-[60vh] lg:min-h-[600px]"
    >
      <div className="container-page relative h-full flex flex-col gap-4 lg:block">
        {/* Statement — inside the panel's notch on desktop, above the panel on mobile */}
        <div className="relative z-20 lg:absolute lg:top-0 lg:left-0 lg:w-[min(52%,640px)] lg:bg-bg lg:pr-8 lg:pb-6 lg:rounded-br-[28px]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-px bg-champagne" />
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-muted">{t("title")}</p>
          </div>
          <h1
            className="font-black text-ink tracking-[-0.035em] leading-[1.02]"
            style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.6rem)" }}
          >
            {t("heroStatement")}
          </h1>
          <ConcaveCorner className="top-0 -right-[28px]" />
          <ConcaveCorner className="left-0 -bottom-[28px]" />
        </div>

        {/* Photo panel */}
        <div
          className="relative h-64 sm:h-80 lg:h-full overflow-hidden bg-bg-secondary touch-pan-y"
          style={{ borderRadius: RADIUS }}
          onPointerDown={(e) => {
            swipeStart.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (swipeStart.current === null) return;
            const delta = e.clientX - swipeStart.current;
            swipeStart.current = null;
            if (Math.abs(delta) > 50) goTo(active + (delta < 0 ? 1 : -1));
          }}
        >
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
                src={activeCategory ? categoryImage(activeCategory) : HERO_FALLBACK}
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Soft wash so the white cards read against any photo */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(29,35,41,0.42) 0%, rgba(29,35,41,0.08) 45%, transparent 70%)",
            }}
          />

          <div className="absolute top-4 right-4 z-10">{controls}</div>
        </div>

        {/* Description card — bottom-left of the panel on desktop */}
        <div className="relative z-10 lg:absolute lg:left-4 lg:bottom-4 lg:w-[380px]">
          {stacked((category, i) => {
            const description = categoryDescription(category, locale);
            const preview = previews[category.id];
            const name = localized(category, locale);
            return (
              <div
                className="bg-white p-5 md:p-6 flex flex-col gap-3"
                style={{ borderRadius: 22, boxShadow: "0 20px 50px rgba(29,35,41,0.14)" }}
              >
                <div>
                  <h2
                    className="font-black text-ink tracking-[-0.03em] leading-[1.02]"
                    style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.1rem)" }}
                  >
                    {name}
                    <span className="ml-2 align-top font-spec text-xs font-semibold tracking-normal text-champagne tabular-nums">
                      {pad(i + 1)}
                    </span>
                  </h2>
                  {preview && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-champagne">
                      {t("productCount", { count: preview.count })}
                    </p>
                  )}
                </div>
                {description && <p className="text-sm text-ink/75 leading-relaxed">{description}</p>}
                <Link
                  href={`/proizvodi/${category.slug}`}
                  className="group/cta inline-flex items-center gap-3 self-start text-sm font-semibold text-ink"
                >
                  <span className="w-11 h-11 rounded-full bg-petrol text-white flex items-center justify-center shrink-0 transition-colors group-hover/cta:bg-petrol-dark">
                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.75}
                      className="transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                    />
                  </span>
                  {t("viewCategory", { name })}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Product cards — bottom-right of the panel on desktop */}
        <div className="relative z-10 lg:absolute lg:right-4 lg:bottom-4 lg:w-[300px]">
          {stacked((category) => {
            const products = previews[category.id]?.products.slice(0, 3) ?? [];
            if (products.length === 0) return null;
            return (
              <ul className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
                {products.map((product, p) => {
                  const name = localized(product, locale);
                  const image = productThumbUrl(product.images?.[0]);
                  const code = catalogueNumber(product);
                  return (
                    <li key={product.id} className={p >= 2 ? "hidden sm:block" : undefined}>
                      <Link
                        href={`/proizvodi/${category.slug}/${product.slug}`}
                        className="group/tile flex h-full items-center gap-3 p-2 pr-3.5 transition-shadow"
                        style={{
                          borderRadius: 18,
                          background: "rgba(253,251,247,0.92)",
                          border: "1px solid rgba(255,255,255,0.7)",
                          backdropFilter: "blur(14px) saturate(160%)",
                          WebkitBackdropFilter: "blur(14px) saturate(160%)",
                          boxShadow: "0 10px 30px rgba(29,35,41,0.12)",
                        }}
                      >
                        <span className="relative w-12 h-12 shrink-0 overflow-hidden rounded-[12px] bg-bg-secondary flex items-center justify-center">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={18} strokeWidth={1.5} className="text-petrol/50" aria-hidden />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold leading-snug text-ink line-clamp-2">
                            {name}
                          </span>
                          {code && (
                            <span className="block mt-0.5 font-spec text-[11px] text-muted truncate">{code}</span>
                          )}
                        </span>
                        <ArrowUpRight
                          size={14}
                          strokeWidth={1.5}
                          className="shrink-0 text-muted transition-transform group-hover/tile:-translate-y-0.5 group-hover/tile:translate-x-0.5 group-hover/tile:text-petrol"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            );
          })}
        </div>
      </div>
    </section>
  );
}
