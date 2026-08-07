"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/lib/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

type RoomKey = "bathroom" | "living" | "bedroom" | "technical";

const ROOM_ORDER: RoomKey[] = ["bathroom", "living", "bedroom", "technical"];

const PIN_POSITION: Record<RoomKey, { left: string; top: string }> = {
  bedroom: { left: "41%", top: "29%" },
  bathroom: { left: "56%", top: "31%" },
  living: { left: "52%", top: "58%" },
  technical: { left: "80%", top: "52%" },
};

const EASE = "cubic-bezier(0.32,0.72,0,1)";

export function RoomSelector() {
  const t = useTranslations("home");
  const [active, setActive] = useState<RoomKey | null>(null);

  const isZoomed = active !== null;
  const origin = active ? PIN_POSITION[active] : { left: "50%", top: "50%" };
  const items = active ? (t.raw(`rooms.${active}.items`) as string[]) : [];

  return (
    <section className="bg-bg-secondary py-16 md:py-20 lg:min-h-[100vh] lg:flex lg:items-center">
      <div className="container-page w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan mb-3">
              {t("roomSelectorLabel")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight leading-[1.15] max-w-lg">
              {t("roomSelectorTitle")}
            </h2>
          </div>
          <p className="text-sm text-muted italic shrink-0">
            {t("roomSelectorHint")}
          </p>
        </div>

        {/* Immersive stage */}
        <div
          className="relative overflow-hidden"
          style={{ borderRadius: "24px", boxShadow: "0 32px 90px rgba(29,35,41,0.18)" }}
        >
          <div
            className="relative w-full overflow-hidden bg-ink"
            style={{ aspectRatio: "1760 / 1328" }}
          >
            <Image
              src="/images/home/room-hotspot-house.jpg"
              alt={t("roomSelectorTitle")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1280px"
              style={{
                objectPosition: "center 30%",
                transformOrigin: `${origin.left} ${origin.top}`,
                transform: isZoomed ? "scale(2.6)" : "scale(1)",
                filter: isZoomed
                  ? "brightness(0.72) saturate(1.08)"
                  : "brightness(1) saturate(1)",
                transition: `transform 1100ms ${EASE}, filter 1100ms ${EASE}`,
              }}
            />

            {/* Legibility scrim once zoomed */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,20,24,0.55) 0%, rgba(10,20,24,0) 45%)",
                opacity: isZoomed ? 1 : 0,
                transition: `opacity 700ms ${EASE}`,
              }}
            />

            {/* Back to full house */}
            <button
              onClick={() => setActive(null)}
              className="absolute inline-flex items-center gap-2 rounded-full font-semibold text-[11px] uppercase tracking-wider text-ink cursor-pointer"
              style={{
                left: "clamp(14px, 3vw, 24px)",
                top: "clamp(14px, 3vw, 24px)",
                minHeight: "40px",
                background: "rgba(247,244,239,0.92)",
                padding: "10px 18px 10px 14px",
                opacity: isZoomed ? 1 : 0,
                transform: isZoomed ? "translateX(0)" : "translateX(-8px)",
                pointerEvents: isZoomed ? "auto" : "none",
                transition: `opacity 400ms ${EASE} 200ms, transform 400ms ${EASE} 200ms`,
              }}
            >
              <ArrowLeft size={12} strokeWidth={2} />
              {t("roomBackToHouse")}
            </button>

            {/* Pins — tablet/desktop only, mobile uses the picker below */}
            <div className="hidden md:block">
              {ROOM_ORDER.map((room) => (
                <button
                  key={room}
                  onClick={() => setActive(room)}
                  aria-label={t(`rooms.${room}.title`)}
                  className="absolute flex items-center justify-center cursor-pointer"
                  style={{
                    left: PIN_POSITION[room].left,
                    top: PIN_POSITION[room].top,
                    width: "40px",
                    height: "40px",
                    transform: "translate(-50%, -50%)",
                    opacity: isZoomed ? 0 : 1,
                    pointerEvents: isZoomed ? "none" : "auto",
                    transition: `opacity 350ms ${EASE}, transform 350ms ${EASE}`,
                  }}
                >
                  <span
                    className="absolute rounded-full animate-ping"
                    style={{ width: "15px", height: "15px", border: "1.5px solid #39AFC3", opacity: 0.5 }}
                  />
                  <span
                    className="rounded-full"
                    style={{
                      width: "12px",
                      height: "12px",
                      background: "#C6A46A",
                      border: "3px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 2px 10px rgba(10,20,24,0.4)",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Overlapping content card — same motif as the About section */}
            <div
              className="absolute bg-white overflow-y-auto"
              style={{
                left: "clamp(14px, 3vw, 24px)",
                right: "clamp(14px, 3vw, 24px)",
                bottom: "clamp(14px, 3vw, 24px)",
                maxWidth: "400px",
                borderRadius: "18px",
                padding: "clamp(18px, 3vw, 26px) clamp(18px, 3.4vw, 28px)",
                boxShadow: "0 24px 64px rgba(10,20,24,0.28)",
                maxHeight: "calc(100% - 28px)",
                opacity: isZoomed ? 1 : 0,
                transform: isZoomed ? "translateY(0)" : "translateY(18px)",
                pointerEvents: isZoomed ? "auto" : "none",
                transition: `opacity 550ms ${EASE} 380ms, transform 550ms ${EASE} 380ms`,
              }}
            >
              <button
                onClick={() => setActive(null)}
                aria-label={t("roomCardClose")}
                className="absolute rounded-full flex items-center justify-center cursor-pointer"
                style={{ top: "14px", right: "14px", width: "32px", height: "32px", background: "#E7E2DA", color: "#1D2329" }}
              >
                <X size={13} strokeWidth={2} />
              </button>

              {active && (
                <>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.14em] text-champagne mb-2"
                    style={{ paddingRight: "34px" }}
                  >
                    {t(`rooms.${active}.tab`)}
                  </p>
                  <h3
                    className="font-extrabold tracking-tight text-ink mb-2.5"
                    style={{ fontSize: "clamp(1.15rem, 3.2vw, 1.35rem)", paddingRight: "34px" }}
                  >
                    {t(`rooms.${active}.title`)}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-4">
                    {t(`rooms.${active}.desc`)}
                  </p>
                  <ul className="flex flex-wrap gap-2 mb-5">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="text-xs font-semibold text-petrol rounded-full px-3 py-1.5"
                        style={{ background: "rgba(14,79,95,0.07)" }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/proizvodi"
                    className="inline-flex items-center gap-2.5 bg-petrol text-white rounded-full pl-5 pr-2 py-2.5 text-sm font-semibold"
                  >
                    {t("ctaProducts")}
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                      <ArrowRight size={13} strokeWidth={1.5} />
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile room picker — replaces on-photo pins below md */}
        <div className="md:hidden mt-4">
          <label
            htmlFor="room-picker-select"
            className="block text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-2 ml-1"
          >
            {t("roomPickerLabel")}
          </label>
          <select
            id="room-picker-select"
            value={active ?? ""}
            onChange={(e) => setActive(e.target.value as RoomKey)}
            className="w-full font-bold text-ink bg-white border cursor-pointer appearance-none"
            style={{
              minHeight: "52px",
              borderColor: "#D8DDE1",
              borderWidth: "1.5px",
              borderRadius: "999px",
              padding: "0 20px",
              fontSize: "15px",
              boxShadow: "0 8px 24px rgba(29,35,41,0.06)",
            }}
          >
            <option value="" disabled>
              {t("roomPickerLabel")}
            </option>
            {ROOM_ORDER.map((room) => (
              <option key={room} value={room}>
                {t(`rooms.${room}.tab`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
