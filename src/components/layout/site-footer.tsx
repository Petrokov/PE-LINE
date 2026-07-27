"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useContactModal } from "@/components/contact/contact-modal-context";
import type { SiteSettings } from "@/lib/types";

interface SiteFooterProps {
  locale: string;
  settings: SiteSettings | null;
}

export function SiteFooter({ locale: _locale, settings }: SiteFooterProps) {
  const t = useTranslations();
  const { open: openContact } = useContactModal();
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "/proizvodi", label: t("nav.products") },
    { href: "/o-nama", label: t("nav.about") },
    { href: "/preuzimanja", label: t("nav.downloads") },
  ];

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "#0F1317" }}
    >
      {/* ── Background wordmark — editorial depth layer ── */}
      <Image
        src="/images/categories/footer/PE-LINE-white.png"
        alt=""
        width={800}
        height={240}
        className="absolute select-none pointer-events-none object-contain object-right-bottom"
        style={{
          width: "clamp(28rem, 60vw, 60rem)",
          height: "auto",
          bottom: "-1rem",
          right: "-1rem",
          opacity: 0.032,
        }}
        aria-hidden="true"
      />

      {/* ── Subtle top accent line ── */}
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(14,79,95,0.6) 35%, rgba(198,164,106,0.4) 65%, transparent 100%)",
        }}
      />

      <div className="container-page py-16 relative z-10">
        {/* ── Top section: brand + columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1.2fr] gap-12 md:gap-16">

          {/* Brand column */}
          <div>
            <div className="flex items-center mb-6">
              <Image
                src="/images/categories/footer/PE-LINE-white.png"
                alt="PE-LINE"
                width={140}
                height={42}
                className="object-contain object-left"
                style={{ width: "140px", height: "auto" }}
              />
            </div>

            <p
              className="text-sm leading-relaxed max-w-xs mb-6"
              style={{ color: "rgba(255,255,255,0.48)" }}
            >
              {t("footer.slogan")}
            </p>

            <div className="flex flex-col gap-2.5">
              <a
                href={`tel:${settings?.phone ?? "+38516473111"}`}
                className="inline-flex items-center gap-2 text-sm transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <Phone size={13} strokeWidth={1.5} />
                <span className="hover:text-white/85 transition-colors">
                  {settings?.phone ?? "+385 1 6473 111"}
                </span>
              </a>
              <a
                href={`mailto:${settings?.email ?? "info@pe-line.hr"}`}
                className="inline-flex items-center gap-2 text-sm transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                <Mail size={13} strokeWidth={1.5} />
                <span className="hover:text-white/85 transition-colors">
                  {settings?.email ?? "info@pe-line.hr"}
                </span>
              </a>
              {settings?.address && (
                <div
                  className="flex items-start gap-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  <MapPin size={13} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-6"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Navigacija
            </p>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm w-fit transition-colors duration-300"
                  style={{ color: "rgba(255,255,255,0.52)" }}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={openContact}
                className="text-sm w-fit text-left transition-colors duration-300 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.52)" }}
              >
                {t("nav.contact")}
              </button>
            </nav>
          </div>

          {/* CTA column */}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em] mb-6"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              Kontaktirajte nas
            </p>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Stručna podrška, tehničke konzultacije, upiti o dostavi — tu smo
              svakim radnim danom od 8:00 do 16:00.
            </p>
            <button
              onClick={openContact}
              className="inline-flex items-center gap-3 rounded-full pl-5 pr-2 py-2.5 text-sm font-semibold text-white active:scale-[0.97] transition-all duration-300 cursor-pointer"
              style={{
                background: "rgba(14,79,95,0.75)",
                border: "1px solid rgba(14,79,95,0.6)",
              }}
            >
              <span>Pošalji upit</span>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 8L8 2M8 2H4M8 2V6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-14 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            © {year} {t("footer.company")} — {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={openContact}
              className="text-xs transition-colors duration-300 cursor-pointer"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              {t("footer.privacy")}
            </button>
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: "rgba(198,164,106,0.4)" }}
            />
            <span
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              pe-line.hr
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
