import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactModalProvider } from "@/components/contact/contact-modal-context";
import { ContactModal } from "@/components/contact/contact-modal";
import { getSettings } from "@/lib/queries";

// Pages are cached and re-rendered at most hourly; admin actions revalidate immediately.
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "hr" | "sl" | "en")) {
    notFound();
  }
  setRequestLocale(locale);

  const [messages, settings] = await Promise.all([
    getMessages(),
    getSettings(),
  ]);

  return (
    <NextIntlClientProvider messages={messages}>
      <ContactModalProvider>
        <SiteHeader locale={locale} settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} settings={settings} />
        <ContactModal settings={settings} />
      </ContactModalProvider>
    </NextIntlClientProvider>
  );
}
