import { getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/queries";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ProductsHero } from "@/components/products/products-hero";
import { CategoryBentoCard } from "@/components/products/category-bento-card";
import type { Locale } from "@/lib/types";
import { localized } from "@/lib/types";

const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  "podno-grijanje": "/images/categories/podno-grijanje.jpg",
  "radijatori": "/images/categories/radijatori.jpg",
  "ventilokonvektori": "/images/categories/ventilokonvektori.jpg",
  "spremnici": "/images/categories/spremnici.jpg",
  "dimovodi": "/images/categories/dimovodi.jpg",
  "regulacije": "/images/categories/regulacije.jpg",
  "ormarici": "/images/categories/ormarcici.jpg",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  return { title: t("title") };
}

export default async function ProizvodiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  const categories = await getCategories();

  return (
    <div className="bg-bg">
      <ProductsHero
        categories={categories}
        locale={locale as Locale}
        subtitle={t("allCategories")}
        exploreLabel="Istraži"
      />

      <div className="container-page section-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, i) => {
            const name = localized(category, locale as Locale);
            const description =
              locale === "sl" ? category.description_sl :
              locale === "en" ? category.description_en :
              category.description_hr;
            const imageSrc = category.heroImageUrl ?? FALLBACK_IMAGE_BY_SLUG[category.slug];
            const isFeature = i === 0;

            return (
              <FadeIn
                key={category.id}
                delay={i * 0.07}
                className={isFeature ? "h-full lg:col-span-2" : "h-full"}
              >
                <CategoryBentoCard
                  href={`/proizvodi/${category.slug}`}
                  name={name}
                  description={description}
                  imageSrc={imageSrc}
                  isFeature={isFeature}
                  exploreLabel="Istraži"
                />
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
