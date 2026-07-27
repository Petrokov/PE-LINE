import { HeroSection } from "@/components/home/hero-section";
import { StatsBar } from "@/components/home/stats-bar";
import { CategoryCards } from "@/components/home/category-cards";
import { RoomSelector } from "@/components/home/room-selector";
import { AboutSection } from "@/components/home/about-section";
import { getCategories } from "@/lib/queries";
import type { Locale } from "@/lib/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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
