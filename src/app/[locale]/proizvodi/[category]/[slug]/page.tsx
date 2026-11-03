import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductBySlug } from "@/lib/queries";
import { ProductSpecs } from "@/components/products/product-specs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductInquiryActions } from "@/components/inquiry/product-inquiry-actions";
import { FadeInLeft, FadeInRight } from "@/components/ui/motion-wrapper";
import { Link } from "@/lib/navigation";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { localized } from "@/lib/types";
import { formatSapDescription } from "@/lib/sap-description";

// Rendered on first visit, then cached (ISR).
export async function generateStaticParams() {
  return [];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category: categorySlug, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "products" });

  const product = await getProductBySlug(categorySlug, slug);
  if (!product) notFound();

  const name = localized(product, locale as Locale);
  const categoryName = product.category ? localized(product.category, locale as Locale) : "";
  // Hand-written text wins; otherwise the description imported from SAP (Croatian only).
  const description =
    (locale === "sl" && product.description_sl) ||
    (locale === "en" && product.description_en) ||
    product.description_hr ||
    (product.sap_description ? formatSapDescription(product.sap_description) : null);

  return (
    <div className="bg-bg section-lg">
      <div className="container-page">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-8 flex-wrap">
          <Link href="/proizvodi" className="hover:text-ink transition-colors">{t("title")}</Link>
          <ChevronRight size={14} strokeWidth={1.5} />
          <Link href={`/proizvodi/${categorySlug}`} className="hover:text-ink transition-colors">
            {categoryName}
          </Link>
          <ChevronRight size={14} strokeWidth={1.5} />
          <span className="text-ink font-medium">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Slike */}
          <FadeInLeft>
            <ProductGallery images={product.images ?? []} name={name} />
          </FadeInLeft>

          {/* Detalji */}
          <FadeInRight>
            <div>
              {product.featured && (
                <span
                  className="inline-block px-3 py-1 text-xs font-semibold bg-champagne text-white mb-4"
                  style={{ borderRadius: "6px" }}
                >
                  {t("featuredBadge")}
                </span>
              )}

              <h1 className="text-3xl font-bold text-ink tracking-tight mb-4">{name}</h1>

              {product.price_range && (
                <p className="text-xl font-spec font-semibold text-champagne mb-6">
                  {product.price_range}
                </p>
              )}

              <div className="mb-8">
                <ProductInquiryActions
                  slug={product.slug}
                  categorySlug={categorySlug}
                  title={name}
                  imageUrl={product.images?.[0] ?? ""}
                />
              </div>

              {description && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">
                    {t("description")}
                  </h3>
                  <p className="text-ink leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              )}

              {product.specs && product.specs.length > 0 && (
                <ProductSpecs specs={product.specs} title={t("specs")} />
              )}
            </div>
          </FadeInRight>
        </div>
      </div>
    </div>
  );
}
