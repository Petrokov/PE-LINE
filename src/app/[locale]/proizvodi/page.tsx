import { getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/queries";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ProductsHero } from "@/components/products/products-hero";
import { Link } from "@/lib/navigation";
import { ArrowRight, Package } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, i) => {
            const name = localized(category, locale as Locale);
            const description =
              locale === "sl" ? category.description_sl :
              locale === "en" ? category.description_en :
              category.description_hr;
            const imageSrc = category.heroImageUrl ?? FALLBACK_IMAGE_BY_SLUG[category.slug];

            return (
              <FadeIn key={category.id} delay={i * 0.07} className="h-full">
                <Link
                  href={`/proizvodi/${category.slug}`}
                  className="group card-interactive block h-full"
                >
                  <div
                    className="bg-white border border-line overflow-hidden flex flex-col h-full"
                    style={{ borderRadius: "16px", boxShadow: "0 24px 60px rgba(29,35,41,0.08)" }}
                  >
                    <div className="bg-bg-secondary flex items-center justify-center overflow-hidden shrink-0" style={{ aspectRatio: "16/9" }}>
                      {imageSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageSrc}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={40} strokeWidth={1} className="text-line" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="text-lg font-semibold text-ink mb-2">{name}</h2>
                      {description && (
                        <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">{description}</p>
                      )}
                      <div className="flex items-center gap-1 text-sm font-medium text-petrol group-hover:text-cyan transition-colors mt-auto">
                        Istraži <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
