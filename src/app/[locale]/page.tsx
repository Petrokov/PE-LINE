import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";
import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { CategoryCards } from "@/components/home/category-cards";
import { RoomSelector } from "@/components/home/room-selector";
import { AboutSection } from "@/components/home/about-section";
import { getCategories } from "@/lib/queries";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const [products, home] = await Promise.all([
    getTranslations({ locale, namespace: "products" }),
    getTranslations({ locale, namespace: "home" }),
  ]);
  return {
    // The home page carries the brand first; the layout's "%s | PE-LINE" template would repeat it.
    title: { absolute: `PE-LINE | ${products("heroStatement")}` },
    description: home("heroSubtitle"),
    alternates: localeAlternates(locale, ""),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = await getCategories();

  return (
    <>
      <HeroSection />
      <StatsBar />
      <RoomSelector />
      <CategoryCards categories={categories} locale={locale as Locale} />
      <AboutSection />
    </>
  );
}
