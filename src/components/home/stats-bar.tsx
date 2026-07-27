"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

const EASE = [0.32, 0.72, 0, 1] as const;

export function StatsBar() {
  const t = useTranslations("home");

  const smallStats = [
    { value: t("statsProducts"), label: t("statsProductsLabel") },
    { value: t("statsPartners"), label: t("statsPartnersLabel") },
    { value: t("statsProjects"), label: t("statsProjectsLabel") },
  ];

  return (
    <section className="bg-petrol overflow-hidden relative">
      {/* Subtle texture layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(57,175,195,0.08) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="container-page relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-stretch">

          {/* ── Hero stat — left, dominates ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: EASE }}
            className="py-12 lg:py-14 lg:pr-16 lg:flex-[2.4] flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-white/10"
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Petrokov d.o.o. — od 1993.
            </p>
            <div>
              <p
                className="font-black text-white leading-none tracking-[-0.03em] font-spec"
                style={{ fontSize: "clamp(3.25rem, 5.5vw, 5.5rem)" }}
              >
                {t("statsYears")}
              </p>
              <p className="text-white/50 text-base font-medium mt-3">
                {t("statsYearsLabel")}
              </p>
            </div>
          </motion.div>

          {/* ── Small stats — right three ── */}
          <div className="flex flex-col sm:flex-row lg:flex-1">
            {smallStats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.08 + i * 0.1, ease: EASE }}
                className={[
                  "flex-1 py-8 sm:py-10 lg:py-14 sm:px-10 flex flex-col justify-center",
                  i > 0
                    ? "border-t sm:border-t-0 sm:border-l border-white/10"
                    : "lg:pl-12 lg:border-l border-white/10",
                ].join(" ")}
              >
                <p
                  className="font-bold text-white tracking-tight leading-none font-spec"
                  style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)" }}
                >
                  {value}
                </p>
                <p className="text-white/50 text-sm font-medium mt-2">{label}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
