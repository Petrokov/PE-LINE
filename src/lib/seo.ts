import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** The public domain. Search engines should only index the site there. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pe-line.hr").replace(/\/+$/, "");

const SITE_HOST = new URL(SITE_URL).host;

/**
 * Whether a request reached the public domain (with or without www). Vercel's
 * own *.vercel.app and preview URLs are not it, and must stay out of search
 * results until the domain points here.
 */
export function isPublicHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const bare = host.toLowerCase().split(":")[0].replace(/^www\./, "");
  return bare === SITE_HOST.replace(/^www\./, "");
}

/**
 * Canonical URL and hreflang alternates for a page that exists in every
 * locale. `path` is the locale-less path, e.g. "/proizvodi/radijatori".
 */
export function localeAlternates(locale: string, path = ""): Metadata["alternates"] {
  const suffix = path === "/" ? "" : path;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${suffix}`])
  );
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${suffix}`;
  return { canonical: `${SITE_URL}/${locale}${suffix}`, languages };
}

/** A meta description from longer text: whitespace collapsed, cut at a word near `max`. */
export function metaDescription(text: string | null | undefined, max = 155): string | undefined {
  const clean = text?.replace(/\s+/g, " ").replace(/^[-–•]\s*/, "").trim();
  if (!clean) return undefined;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).replace(/[,;:.\s]+$/, "")}…`;
}
