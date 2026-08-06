import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCategoryBySlug } from "@/lib/queries";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Link } from "@/lib/navigation";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { localized } from "@/lib/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const name = localized(category, locale as Locale);
  const products = category.products;

  return (
    <div className="bg-bg section-lg">
      <div className="container-page">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link href="/proizvodi" className="hover:text-ink transition-colors">{t("title")}</Link>
          <ChevronRight size={14} strokeWidth={1.5} />
          <span className="text-ink font-medium">{name}</span>
        </nav>

        <FadeIn className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-champagne mb-4">
            {t("categoryEyebrow")}
          </p>
          <h1
            className="font-black text-ink tracking-[-0.03em] leading-[1.05] mb-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            {name}
          </h1>
          {category.description_hr && (
            <p className="text-muted text-lg max-w-2xl leading-relaxed">
              {locale === "sl" ? category.description_sl :
               locale === "en" ? category.description_en :
               category.description_hr}
            </p>
          )}
        </FadeIn>

        {products.length === 0 ? (
          <p className="text-muted text-center py-16">{t("noProducts")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 0.06} className="h-full">
                <ProductCard
                  product={product}
                  locale={locale as Locale}
                  categorySlug={categorySlug}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
