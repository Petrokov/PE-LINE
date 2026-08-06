"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

const EASE = [0.32, 0.72, 0, 1] as const;

const SLIDE_STATIC = [
  {
    id: "dimovodi",
    image: "/images/categories/dimovodi.jpg",
    bgGradient: "linear-gradient(145deg, #2C2C2C 0%, #4A4A4A 65%, #6B6B6B 100%)",
    accentHex: "#4A4A4A",
  },
  {
    id: "ormarcici",
    image: "/images/categories/ormarcici.jpg",
    bgGradient: "linear-gradient(145deg, #0A3A47 0%, #0E4F5F 65%, #1A6B80 100%)",
    accentHex: "#0E4F5F",
  },
  {
    id: "podno-grijanje",
    image: "/images/categories/podno-grijanje.jpg",
    bgGradient: "linear-gradient(145deg, #1A6B80 0%, #39AFC3 100%)",
    accentHex: "#39AFC3",
  },
  {
    id: "radijatori",
    image: "/images/categories/radijatori.jpg",
    bgGradient: "linear-gradient(145deg, #7A5B28 0%, #C6A46A 100%)",
    accentHex: "#C6A46A",
  },
  {
    id: "regulacije",
    image: "/images/categories/regulacije.jpg",
    bgGradient: "linear-gradient(145deg, #1A4A3A 0%, #2D7A5F 100%)",
    accentHex: "#2D7A5F",
  },
  {
    id: "spremnici",
    image: "/images/categories/spremnici.jpg",
    bgGradient: "linear-gradient(145deg, #082E39 0%, #0E4F5F 100%)",
    accentHex: "#1A6B80",
  },
  {
    id: "ventilokonvektori",
    image: "/images/categories/ventilokonvektori.jpg",
    bgGradient: "linear-gradient(145deg, #3A1A5A 0%, #6B3A9A 100%)",
    accentHex: "#6B3A9A",
  },
] as const;

type Slide = { id: string; image: string; bgGradient: string; accentHex: string; nameLine1: string; nameLine2: string; label: string };

/* ── Shared carousel card — used on both tablet (full-width) and desktop (right column) ── */
function CarouselCard({
  activeSlide,
  setActiveSlide,
  slides,
}: {
  activeSlide: number;
  setActiveSlide: (i: number) => void;
  slides: Slide[];
}) {
  const tc = useTranslations("heroCarousel");
  const slide = slides[activeSlide];

  return (
    <div
      className="hero-carousel-card rounded-[2rem] md:rounded-[2.25rem] overflow-hidden flex"
      style={{
        border: "1px solid rgba(216,221,225,0.9)",
        boxShadow: "0 52px 128px rgba(29,35,41,0.14), 0 14px 44px rgba(29,35,41,0.08)",
      }}
    >
      {/* ── LEFT: colored panel ── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ width: "44%" }}>
        {/* Animated gradient BG — crossfade */}
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.id + "-bg"}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            style={{ background: slide.bgGradient }}
          />
        </AnimatePresence>

        {/* Decorative circles */}
        <div
          className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full z-[1] pointer-events-none"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
        <div
          className="absolute top-[18%] -right-6 w-20 h-20 rounded-full z-[1] pointer-events-none"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />

        {/* Text — top-left */}
        <div className="absolute top-4 left-4 md:top-5 md:left-5 lg:top-6 lg:left-6 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + "-text"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <p
                className="font-semibold uppercase"
                style={{
                  color: "rgba(255,255,255,0.52)",
                  fontSize: "8px",
                  letterSpacing: "0.22em",
                }}
              >
                {slide.label}
              </p>
              <h2
                className="font-black"
                style={{
                  color: "white",
                  lineHeight: "0.93",
                  marginTop: "4px",
                  fontSize: "clamp(1.2rem, 2.2vw, 1.95rem)",
                }}
              >
                {slide.nameLine1}
                {slide.nameLine2 && (
                  <>
                    <br />
                    {slide.nameLine2}
                  </>
                )}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Category image — fills bottom 67% */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-img"}
            className="absolute z-10 overflow-hidden"
            style={{ inset: "33% 0 0 0" }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.nameLine1 + (slide.nameLine2 ? " " + slide.nameLine2 : "")}
                fill
                priority={activeSlide === 0}
                className="object-cover"
                style={{ objectPosition: "center top" }}
                sizes="(max-width: 767px) 0px, (max-width: 1023px) 40vw, 20vw"
              />
              <div
                className="absolute inset-x-0 top-0 h-[45%] pointer-events-none z-10"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 100%)",
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── RIGHT: catalog panel ── */}
      <div
        className="flex-1 flex flex-col"
        style={{
          background: "#F9F7F4",
          borderLeft: "1px solid rgba(216,221,225,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="px-4 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(216,221,225,0.55)" }}
        >
          <span
            className="uppercase tracking-[0.2em] font-semibold text-muted"
            style={{ fontSize: "9px" }}
          >
            {tc("asortiman")}
          </span>
          <span className="font-mono text-muted" style={{ fontSize: "9px" }}>
            {activeSlide + 1}/{slides.length}
          </span>
        </div>

        {/* Category rows */}
        <div className="flex-1 flex flex-col px-2 md:px-2.5 lg:px-2 py-1.5 md:py-2 gap-0.5 lg:gap-[3px] overflow-y-auto">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSlide(i)}
              className="flex items-center gap-2 rounded-xl px-2 py-1 md:py-1.5 text-left w-full shrink-0"
              style={{
                background: i === activeSlide ? s.accentHex + "14" : "transparent",
                border: `1px solid ${i === activeSlide ? s.accentHex + "35" : "transparent"}`,
                transition: "all 280ms cubic-bezier(0.32,0.72,0,1)",
                cursor: "pointer",
              }}
              aria-label={`Prikaži ${s.nameLine1}${s.nameLine2 ? " " + s.nameLine2 : ""}`}
            >
              {/* Thumbnail */}
              <div
                className="relative w-7 h-7 md:w-8 md:h-8 rounded-lg overflow-hidden flex-shrink-0 border"
                style={{ borderColor: "rgba(216,221,225,0.7)" }}
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                  aria-hidden="true"
                />
              </div>

              {/* Name */}
              <span
                className="flex-1 text-[11px] md:text-xs font-semibold leading-snug"
                style={{
                  color: i === activeSlide ? "#69727D" : "#9CA3AF",
                  transition: "color 280ms",
                }}
              >
                {s.nameLine1}
                {s.nameLine2 ? " " + s.nameLine2 : ""}
              </span>

              {/* Active checkmark / inactive arrow */}
              {i === activeSlide ? (
                <div
                  className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: s.accentHex }}
                >
                  <svg width="7" height="5" viewBox="0 0 7 5" fill="none" aria-hidden="true">
                    <path
                      d="M1 2.5L2.8 4L6 1"
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="flex-shrink-0"
                  style={{ opacity: 0.28 }}
                  aria-hidden="true"
                >
                  <path
                    d="M4.5 9L7.5 6L4.5 3"
                    stroke="#69727D"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Footer — progress dots + link */}
        <div
          className="px-4 pb-4 pt-3 flex items-center gap-1.5"
          style={{ borderTop: "1px solid rgba(216,221,225,0.55)" }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                height: "3px",
                borderRadius: "2px",
                width: i === activeSlide ? "22px" : "6px",
                background: i === activeSlide ? slide.accentHex : "#D8DDE1",
                transition: "all 350ms cubic-bezier(0.32,0.72,0,1)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            />
          ))}
          <Link
            href="/proizvodi"
            className="ml-auto flex items-center gap-1 font-semibold hover:opacity-70 transition-opacity"
            style={{ color: slide.accentHex, fontSize: "10px" }}
          >
            {tc("allProducts")}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path
                d="M1.5 6.5L6.5 1.5M6.5 1.5H3.5M6.5 1.5V4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("home");
  const tc = useTranslations("heroCarousel");
  const sectionRef = useRef<HTMLElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const SLIDE_TEXT = [
    { nameLine1: tc("slide0Name1"), nameLine2: tc("slide0Name2"), label: tc("slide0Label") },
    { nameLine1: tc("slide1Name1"), nameLine2: tc("slide1Name2"), label: tc("slide1Label") },
    { nameLine1: tc("slide2Name1"), nameLine2: tc("slide2Name2"), label: tc("slide2Label") },
    { nameLine1: tc("slide3Name1"), nameLine2: tc("slide3Name2"), label: tc("slide3Label") },
    { nameLine1: tc("slide4Name1"), nameLine2: tc("slide4Name2"), label: tc("slide4Label") },
    { nameLine1: tc("slide5Name1"), nameLine2: tc("slide5Name2"), label: tc("slide5Label") },
    { nameLine1: tc("slide6Name1"), nameLine2: tc("slide6Name2"), label: tc("slide6Label") },
  ];
  const SLIDES = SLIDE_STATIC.map((s, i) => ({ ...s, ...SLIDE_TEXT[i] }));

  /* ── Auto-rotate ── */
  useEffect(() => {
    if (carouselPaused) return;
    const timer = setInterval(
      () => setActiveSlide((i) => (i + 1) % SLIDES.length),
      3800
    );
    return () => clearInterval(timer);
  }, [carouselPaused, SLIDES.length]);

  const title = t("heroTitle");
  const firstSpace = title.indexOf(" ");
  const word1 = firstSpace > -1 ? title.slice(0, firstSpace) : title;
  const wordRest = firstSpace > -1 ? title.slice(firstSpace) : "";

  const trustItems = [
    t("trustAvailability"),
    t("trustSupport"),
    t("trustRange"),
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] lg:h-[100dvh] flex items-center lg:items-start 2xl:items-center py-20 md:py-24 lg:pt-32 lg:pb-12 xl:pt-32 xl:pb-16 2xl:py-28 overflow-hidden bg-bg"
    >
      <div className="container-page relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-10 lg:gap-16 xl:gap-20 items-start lg:items-center">

          {/* ── LEFT: Editorial copy ── */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex items-center gap-3 mb-6 md:mb-8 lg:mb-5"
            >
              <span
                className="inline-flex items-center rounded-full px-3 py-[5px] text-[10px] uppercase tracking-[0.2em] font-semibold border"
                style={{
                  background: "rgba(14,79,95,0.07)",
                  borderColor: "rgba(14,79,95,0.2)",
                  color: "#0E4F5F",
                }}
              >
                {t("heroBadge")}
              </span>
              <span className="relative inline-flex w-3 h-3 items-center justify-center">
                <span
                  className="absolute w-2.5 h-2.5 rounded-full bg-cyan animate-ping"
                  style={{ opacity: 0.55 }}
                />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan relative" />
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 56, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.05, delay: 0.1, ease: EASE }}
              className="hero-h1 font-black text-ink tracking-[-0.04em] leading-[1.02] mb-5 md:mb-7 lg:mb-4"
            >
              {word1}{wordRest}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.28, ease: EASE }}
              className="text-base md:text-lg text-muted leading-relaxed mb-6 md:mb-8 lg:mb-5 max-w-[440px]"
            >
              {t("heroSubtitle")}
            </motion.p>

            {/* CTA + social proof */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42, ease: EASE }}
              className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 md:mb-10 lg:mb-7"
            >
              <Link
                href="/proizvodi"
                className="group inline-flex items-center gap-3 bg-petrol text-white rounded-full pl-6 md:pl-7 pr-2.5 py-3 font-semibold text-sm active:scale-[0.97]"
                style={{
                  boxShadow: "0 8px 36px rgba(14,79,95,0.28)",
                  transition:
                    "background 500ms cubic-bezier(0.32,0.72,0,1), box-shadow 500ms cubic-bezier(0.32,0.72,0,1), transform 200ms cubic-bezier(0.32,0.72,0,1)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#0A3A47";
                  el.style.boxShadow = "0 16px 52px rgba(14,79,95,0.38)";
                  el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#0E4F5F";
                  el.style.boxShadow = "0 8px 36px rgba(14,79,95,0.28)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <span>{t("ctaProducts")}</span>
                <span
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 8L8 2M8 2H4M8 2V6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>

              {/* Project count */}
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-ink font-semibold">
                  {t("statsProjects")}
                </span>
                <span className="text-xs text-muted font-medium">
                  {t("statsProjectsLabel")}
                </span>
              </div>
            </motion.div>

            {/* Trust items */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.56, ease: EASE }}
              className="flex flex-wrap gap-x-6 md:gap-x-8 gap-y-2.5"
            >
              {trustItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div
                    className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(57,175,195,0.14)" }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3L3 5L7 1"
                        stroke="#39AFC3"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-xs md:text-sm text-muted">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* ── Mobile category strip (< md) ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
              className="md:hidden mt-8"
            >
              <div
                className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4"
              >
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSlide(i)}
                    className="flex-shrink-0 flex items-center gap-2 rounded-2xl border"
                    style={{
                      padding: "7px 12px 7px 7px",
                      background:
                        i === activeSlide ? s.bgGradient : "rgba(255,255,255,0.82)",
                      borderColor:
                        i === activeSlide
                          ? s.accentHex + "55"
                          : "rgba(216,221,225,0.85)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      transition: "all 300ms cubic-bezier(0.32,0.72,0,1)",
                    }}
                  >
                    <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                        aria-hidden="true"
                      />
                    </div>
                    <span
                      className="text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        color: i === activeSlide ? "white" : "#1D2329",
                      }}
                    >
                      {s.nameLine1}
                      {s.nameLine2 ? " " + s.nameLine2 : ""}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── TABLET: Carousel full-width below copy (md only) ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.22, ease: EASE }}
            className="hidden md:block lg:hidden"
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
          >
            <CarouselCard activeSlide={activeSlide} setActiveSlide={setActiveSlide} slides={SLIDES} />
          </motion.div>

          {/* ── DESKTOP: Carousel in right column (lg+) — static tilt ── */}
          <motion.div
            initial={{ opacity: 0, x: 60, filter: "blur(16px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.18, ease: EASE }}
            className="hidden lg:block relative lg:self-start lg:mt-24"
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
          >
            <div className="carousel-tilt relative">
              <CarouselCard activeSlide={activeSlide} setActiveSlide={setActiveSlide} slides={SLIDES} />

              {/* ── Floating badge 1 — bottom-left ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.68, duration: 0.75, ease: EASE }}
                className="absolute -bottom-3 -left-3 xl:-bottom-6 xl:-left-9 z-10"
              >
                <div
                  className="rounded-[1.5rem] p-[5px] border"
                  style={{
                    background: "#F7F4EF",
                    borderColor: "rgba(216,221,225,0.72)",
                    boxShadow: "0 24px 68px rgba(29,35,41,0.14)",
                  }}
                >
                  <div
                    className="rounded-[calc(1.5rem-0.375rem)] bg-white px-4 py-3 flex items-center gap-3"
                    style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(14,79,95,0.08)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                          fill="#0E4F5F"
                          opacity="0.85"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.14em] font-semibold"
                        style={{ color: "#69727D" }}
                      >
                        {tc("badgeExperienceLabel")}
                      </p>
                      <p className="text-sm font-bold text-ink leading-tight">
                        {tc("badgeExperienceValue")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Floating badge 2 — top-right ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.82, duration: 0.65, ease: EASE }}
                className="absolute hidden lg:block -top-7 -right-6 z-10"
              >
                <div
                  className="rounded-[1.25rem] p-[5px] border"
                  style={{
                    background: "rgba(14,79,95,0.15)",
                    borderColor: "rgba(14,79,95,0.28)",
                    boxShadow: "0 20px 56px rgba(14,79,95,0.26)",
                  }}
                >
                  <div
                    className="rounded-[calc(1.25rem-0.375rem)] bg-petrol px-5 py-3"
                    style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12)" }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-[0.14em] font-semibold"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {tc("badgeStockLabel")}
                    </p>
                    <p className="text-sm font-bold text-white leading-tight">
                      {tc("badgeStockValue")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
