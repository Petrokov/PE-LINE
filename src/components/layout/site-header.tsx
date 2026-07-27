"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { useContactModal } from "@/components/contact/contact-modal-context";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { SiteSettings } from "@/lib/types";

interface SiteHeaderProps {
  locale: string;
  settings: SiteSettings | null;
}

const EASE = [0.32, 0.72, 0, 1] as const;

export function SiteHeader({ locale, settings: _settings }: SiteHeaderProps) {
  const t = useTranslations("nav");
  const { open: openContact } = useContactModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/proizvodi", label: t("products") },
    { href: "/o-nama", label: t("about") },
    { href: "/preuzimanja", label: t("downloads") },
  ];

  return (
    <>
      {/* Floating pill nav */}
      <header
        className="fixed left-0 right-0 z-50 flex justify-center px-4"
        style={{
          top: scrolled ? "8px" : "12px",
          transition: "top 400ms cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div className="w-full max-w-5xl">
          {/* Outer shell */}
          <div
            className="rounded-full border p-[5px]"
            style={{
              background: scrolled
                ? "rgba(247,244,239,0.97)"
                : "rgba(247,244,239,0.82)",
              borderColor: scrolled
                ? "rgba(216,221,225,0.9)"
                : "rgba(216,221,225,0.7)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow: scrolled
                ? "0 12px 40px rgba(29,35,41,0.10), 0 2px 8px rgba(29,35,41,0.05), inset 0 1px 1px rgba(255,255,255,0.95)"
                : "0 8px 32px rgba(29,35,41,0.07), 0 2px 8px rgba(29,35,41,0.04), inset 0 1px 1px rgba(255,255,255,0.95)",
              transition:
                "background 400ms cubic-bezier(0.32,0.72,0,1), border-color 400ms cubic-bezier(0.32,0.72,0,1), box-shadow 400ms cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            {/* Inner core */}
            <div
              className="rounded-full flex items-center justify-between px-3 py-2"
              style={{
                background: "#FDFBF7",
                boxShadow: "inset 0 1px 2px rgba(29,35,41,0.04)",
              }}
            >
              {/* Logo — scale transform avoids layout recalc on scroll */}
              <Link
                href="/"
                className="flex items-center shrink-0"
                style={{ width: "100px", height: "30px" }}
              >
                <Image
                  src="/images/categories/header/PE-LINE-logo.png"
                  alt="PE-LINE"
                  width={120}
                  height={36}
                  priority
                  className="object-contain object-left"
                  style={{
                    width: "100%",
                    height: "30px",
                    transform: scrolled ? "scale(0.833)" : "scale(1)",
                    transformOrigin: "left center",
                    transition: "transform 400ms cubic-bezier(0.32,0.72,0,1)",
                  }}
                />
              </Link>

              {/* Desktop nav links */}
              <nav className="hidden md:flex items-center gap-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 text-sm font-medium rounded-full"
                    style={{
                      color: "#69727D",
                      transition:
                        "color 300ms cubic-bezier(0.32,0.72,0,1), background 300ms cubic-bezier(0.32,0.72,0,1)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = "#1D2329";
                      el.style.background = "#F2EEE8";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = "#69727D";
                      el.style.background = "transparent";
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right: locale + CTA + mobile toggle */}
              <div className="flex items-center gap-2">
                <LocaleSwitcher currentLocale={locale} />

                {/* Primary CTA — desktop only */}
                <button
                  onClick={openContact}
                  className="hidden md:inline-flex items-center gap-2 bg-petrol text-white rounded-full px-4 py-2 text-sm font-semibold active:scale-[0.97] cursor-pointer"
                  style={{
                    transition:
                      "background 500ms cubic-bezier(0.32,0.72,0,1), transform 200ms cubic-bezier(0.32,0.72,0,1)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#0A3A47")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#0E4F5F")
                  }
                >
                  <span>{t("contact")}</span>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
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

                {/* Hamburger — morphs to X */}
                <button
                  className="md:hidden w-9 h-9 rounded-full flex flex-col items-center justify-center gap-[5px]"
                  style={{
                    transition: "background 300ms cubic-bezier(0.32,0.72,0,1)",
                  }}
                  onClick={() => setMenuOpen(!menuOpen)}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#F2EEE8")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
                  aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
                >
                  <motion.span
                    animate={menuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.38, ease: EASE }}
                    className="block w-[18px] h-[1.5px] bg-ink origin-center rounded-full"
                  />
                  <motion.span
                    animate={
                      menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
                    }
                    transition={{ duration: 0.22, ease: EASE }}
                    className="block w-[18px] h-[1.5px] bg-ink origin-center rounded-full"
                  />
                  <motion.span
                    animate={
                      menuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.38, ease: EASE }}
                    className="block w-[18px] h-[1.5px] bg-ink origin-center rounded-full"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col md:hidden"
            style={{
              background: "rgba(247,244,239,0.97)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
            }}
          >
            <div className="flex flex-col justify-center h-full px-8 pt-28 pb-16">
              <nav className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{
                      duration: 0.48,
                      delay: 0.04 + i * 0.065,
                      ease: EASE,
                    }}
                  >
                    <Link
                      href={link.href}
                      className="block py-4 text-[2.25rem] font-black tracking-tight text-ink border-b border-line/50 leading-tight"
                      style={{
                        transition:
                          "color 300ms cubic-bezier(0.32,0.72,0,1)",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "#0E4F5F")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "#1D2329")
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{
                    duration: 0.48,
                    delay: 0.04 + navLinks.length * 0.065,
                    ease: EASE,
                  }}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openContact();
                    }}
                    className="block w-full text-left py-4 text-[2.25rem] font-black tracking-tight text-ink border-b border-line/50 leading-tight cursor-pointer"
                    style={{
                      transition: "color 300ms cubic-bezier(0.32,0.72,0,1)",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#0E4F5F")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#1D2329")
                    }
                  >
                    {t("contact")}
                  </button>
                </motion.div>
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42, duration: 0.5 }}
                className="mt-10"
              >
                <LocaleSwitcher currentLocale={locale} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
