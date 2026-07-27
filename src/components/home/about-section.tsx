"use client";

import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";
import { motion } from "motion/react";
import Image from "next/image";
import { Check } from "lucide-react";

const EASE = [0.32, 0.72, 0, 1] as const;

export function AboutSection() {
  const t = useTranslations("home");

  const points = [t("aboutPoint1"), t("aboutPoint2"), t("aboutPoint3")];

  return (
    <section className="bg-bg-secondary section-lg">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -32, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative order-2 lg:order-1"
          >
            <div
              className="overflow-hidden bg-bg"
              style={{ borderRadius: "16px", aspectRatio: "4/3", boxShadow: "var(--shadow-card)" }}
            >
              <Image
                src="/images/categories/veseraj.jpg"
                alt={t("aboutTitle1")}
                width={640}
                height={480}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating stat badge */}
            <div
              className="hidden md:flex absolute items-center gap-4 bg-white p-5"
              style={{
                borderRadius: "16px",
                boxShadow: "0 24px 60px rgba(29,35,41,0.14)",
                bottom: "-1.5rem",
                right: "-1.5rem",
              }}
            >
              <p className="text-3xl font-black text-petrol tracking-tight">
                {t("statsYears")}
              </p>
              <p className="text-xs text-muted leading-tight max-w-[90px]">
                {t("statsYearsLabel")}
              </p>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 32, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="order-1 lg:order-2"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-champagne mb-4">
              {t("aboutEyebrow")}
            </p>
            <h2
              className="font-black text-ink tracking-[-0.03em] leading-[1.08] mb-5"
              style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)" }}
            >
              {t("aboutTitle1")}
              <br />
              {t("aboutTitle2")}
            </h2>
            <p className="text-lg text-muted leading-relaxed mb-7 max-w-lg">
              {t("aboutText")}
            </p>

            <ul className="flex flex-col gap-3 mb-9">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(57,175,195,0.14)" }}
                  >
                    <Check size={11} strokeWidth={2.5} className="text-cyan" />
                  </span>
                  <span className="text-sm text-ink font-medium">{point}</span>
                </li>
              ))}
            </ul>

            <ButtonLink href="/o-nama" variant="primary">
              {t("aboutCta")}
            </ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
