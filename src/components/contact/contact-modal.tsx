"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useContactModal } from "./contact-modal-context";
import { ContactForm } from "./contact-form";
import type { SiteSettings } from "@/lib/types";

const EASE = [0.32, 0.72, 0, 1] as const;

interface ContactModalProps {
  settings: SiteSettings | null;
}

export function ContactModal({ settings }: ContactModalProps) {
  const { isOpen, close, prefillMessage } = useContactModal();
  const t = useTranslations("contact");

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  const contactDetails = [
    {
      label: t("addressLabel"),
      value: settings?.address ?? "Zagreb, Hrvatska",
      href: undefined,
    },
    {
      label: t("hoursLabel"),
      value: t("hours"),
      href: undefined,
    },
    {
      label: t("emailLabel"),
      value: settings?.email ?? "info@pe-line.hr",
      href: `mailto:${settings?.email ?? "info@pe-line.hr"}`,
    },
    {
      label: t("phoneLabel"),
      value: settings?.phone ?? "+385 1 6473 111",
      href: `tel:${settings?.phone ?? "+38516473111"}`,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,12,14,0.6)", backdropFilter: "blur(4px)" }}
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-bg"
            style={{ borderRadius: "20px", boxShadow: "0 40px 100px rgba(29,35,41,0.25)" }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <button
              onClick={close}
              aria-label={t("close")}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center cursor-pointer hover:border-petrol transition-colors"
            >
              <X size={16} strokeWidth={1.5} className="text-ink" />
            </button>

            <div className="p-6 md:p-12">
              {/* Header row: breadcrumb + title | subtitle */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="w-5 h-1.5 rounded-full bg-line-dark" />
                    <span className="w-2.5 h-1.5 rounded-full bg-petrol/40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-champagne" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted ml-1.5">
                      {t("title")}
                    </span>
                  </div>
                  <h2
                    className="font-black text-ink tracking-tight leading-none"
                    style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}
                  >
                    {t("title")}
                  </h2>
                </div>
                <p className="text-sm text-muted leading-relaxed max-w-[240px]">
                  {t("subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-16">
                {/* Left: office info */}
                <div className="space-y-8">
                  {contactDetails.map(({ label, value, href }) => (
                    <div key={label}>
                      <p className="text-sm font-bold text-ink mb-1.5">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm text-muted leading-relaxed hover:text-petrol transition-colors block"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted leading-relaxed">{value}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right: form */}
                <div>
                  <ContactForm prefillMessage={prefillMessage} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
