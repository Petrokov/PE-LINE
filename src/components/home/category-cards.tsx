"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Thermometer, Wind, Flame, Box, Layers, Columns3, Package, Settings, Gauge, SlidersHorizontal, Archive } from "lucide-react";
import { motion } from "motion/react";
import type { Category, Locale } from "@/lib/types";
import { localized } from "@/lib/types";

const ICON_MAP: Record<
  string,
  React.FC<{ size?: number; strokeWidth?: number; className?: string }>
> = {
  Thermometer,
  Wind,
  Flame,
  Box,
  Layers,
  Columns3,
  Package,
  Settings,
  Gauge,
  SlidersHorizontal,
  Archive,
};

function getCategoryIcon(
  iconName?: string | null
): React.FC<{ size?: number; strokeWidth?: number; className?: string }> {
  if (!iconName) return Package;
  return ICON_MAP[iconName] ?? Package;
}

const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  "podno-grijanje": "/images/categories/podno-grijanje.jpg",
  "radijatori": "/images/categories/radijatori.jpg",
  "ventilokonvektori": "/images/categories/ventilokonvektori.jpg",
  "spremnici": "/images/categories/spremnici.jpg",
  "dimovodi": "/images/categories/dimovodi.jpg",
  "regulacije": "/images/categories/regulacije.jpg",
  "ormarici": "/images/categories/ormarcici.jpg",
};

interface CategoryCardsProps {
  categories: Category[];
  locale: Locale;
}

const EASE = [0.32, 0.72, 0, 1] as const;

export function CategoryCards({ categories, locale }: CategoryCardsProps) {
  const t = useTranslations("home");

  return (
    <section className="bg-bg section-lg">
      <div className="container-page">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="mb-14"
        >
          <span
            className="inline-flex items-center rounded-full px-3 py-[5px] text-[10px] uppercase tracking-[0.2em] font-semibold border mb-5"
            style={{
              background: "rgba(14,79,95,0.06)",
              borderColor: "rgba(14,79,95,0.18)",
              color: "#0E4F5F",
            }}
          >
            {t("categoriesEyebrow")}
          </span>
          <h2
            className="font-black text-ink tracking-[-0.03em] leading-[1.05] mb-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            {t("categoriesTitle")}
          </h2>
          <p className="text-lg text-muted max-w-xl leading-relaxed">
            {t("categoriesSubtitle")}
          </p>
        </motion.div>

        {/* Asymmetric bento grid — first card spans 2 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category.icon);
            const name = localized(category, locale);
            const description =
              locale === "sl"
                ? category.description_sl
                : locale === "en"
                ? category.description_en
                : category.description_hr;
            const isFeature = index === 0;
            const imageSrc =
              category.localImage ??
              FALLBACK_IMAGE_BY_SLUG[category.slug];

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 32, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.07,
                  ease: EASE,
                }}
                className={isFeature ? "lg:col-span-2" : ""}
              >
                <Link
                  href={`/proizvodi/${category.slug}`}
                  className="group block h-full"
                >
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
                      {/* Image area */}
                      <div
                        className="relative bg-bg-secondary overflow-hidden flex-shrink-0"
                        style={{
                          aspectRatio: isFeature ? "16/7" : "4/3",
                        }}
                      >
                        {category.heroImageUrl || imageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageSrc ?? category.heroImageUrl!}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-700"
                            style={{
                              transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")
                            }
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon
                              size={isFeature ? 56 : 40}
                              strokeWidth={0.8}
                              className="text-line"
                            />
                          </div>
                        )}

                        {/* Category icon badge — overlaid bottom-left */}
                        <div
                          className="absolute bottom-3 left-3 rounded-full p-[4px] border"
                          style={{
                            background: "rgba(247,244,239,0.9)",
                            borderColor: "rgba(216,221,225,0.6)",
                            backdropFilter: "blur(0px)",
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
                            style={{
                              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)",
                            }}
                          >
                            <Icon size={14} strokeWidth={1.5} className="text-petrol" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3
                          className={`font-bold text-ink leading-snug mb-2 tracking-tight ${
                            isFeature ? "text-xl" : "text-base"
                          }`}
                        >
                          {name}
                        </h3>

                        {description && (
                          <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4 flex-1">
                            {description}
                          </p>
                        )}

                        {/* Inline CTA */}
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-sm font-semibold text-petrol transition-colors duration-300 group-hover:text-cyan-light"
                            style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                          >
                            {t("exploreCategory")}
                          </span>
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500"
                            style={{
                              background: "rgba(14,79,95,0.08)",
                              transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
                            }}
                          >
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                              <path
                                d="M2 8L8 2M8 2H4M8 2V6"
                                stroke="#0E4F5F"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="group-hover:stroke-[#1A6B80] transition-colors"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
