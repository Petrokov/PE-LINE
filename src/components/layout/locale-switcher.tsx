"use client";

import { useRouter, usePathname } from "@/lib/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  hr: "HR",
  sl: "SL",
  en: "EN",
};

interface LocaleSwitcherProps {
  currentLocale: string;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const router = useRouter();
  const fullPathname = usePathname(); // e.g. /hr/proizvodi

  function switchLocale(newLocale: string) {
    router.push(fullPathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-2 py-1 text-xs font-bold rounded-[6px] transition-colors duration-150 ${
            locale === currentLocale
              ? "bg-petrol text-white"
              : "text-muted hover:text-ink border border-transparent hover:border-line"
          }`}
          aria-label={`Switch to ${localeLabels[locale]}`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
