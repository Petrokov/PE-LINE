"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type RoomKey = "bathroom" | "living" | "bedroom" | "technical";

const ROOM_IMAGES: Record<RoomKey, string> = {
  bathroom: "/images/categories/sanitarije.jpg",
  living: "/images/categories/ventilokonvektori.jpg",
  bedroom: "/images/categories/bedroom.jpg",
  technical: "/images/categories/veseraj.jpg",
};

const ROOMS: RoomKey[] = ["bathroom", "living", "bedroom", "technical"];

export function RoomSelector() {
  const t = useTranslations("home");
  const [active, setActive] = useState<RoomKey>("bathroom");

  const items = t.raw(`rooms.${active}.items`) as string[];

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

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => setActive(room)}
              className={[
                "px-5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                active === room
                  ? "bg-petrol text-white border border-petrol"
                  : "bg-transparent text-ink border border-line hover:border-petrol hover:text-petrol",
              ].join(" ")}
              style={{ borderRadius: "10px" }}
            >
              {t(`rooms.${room}.tab`)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left */}
          <div>
            <h3 className="text-2xl font-bold text-ink mb-3">
              {t(`rooms.${active}.title`)}
            </h3>
            <p className="text-muted leading-relaxed mb-8">
              {t(`rooms.${active}.desc`)}
            </p>
            <ul className="flex flex-col">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 py-4 border-b border-line last:border-b-0"
                >
                  <span
                    className="shrink-0 bg-petrol rounded-full"
                    style={{ width: "6px", height: "6px" }}
                  />
                  <span className="text-sm text-ink font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — image */}
          <div
            className="relative overflow-hidden bg-bg"
            style={{ borderRadius: "16px", aspectRatio: "4/3", boxShadow: "var(--shadow-card)" }}
          >
            <Image
              key={active}
              src={ROOM_IMAGES[active]}
              alt={t(`rooms.${active}.title`)}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
