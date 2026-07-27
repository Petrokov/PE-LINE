import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProductBySlug } from "@/lib/queries";
import { ProductSpecs } from "@/components/products/product-specs";
import { ContactModalTrigger } from "@/components/contact/contact-modal-trigger";
import { FadeInLeft, FadeInRight } from "@/components/ui/motion-wrapper";
import { Link } from "@/lib/navigation";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/types";
import { localized } from "@/lib/types";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category: categorySlug, slug } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const name = localized(product, locale as Locale);
  const categoryName = product.category ? localized(product.category, locale as Locale) : "";

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
            <div className="space-y-3">
              {product.images && product.images.length > 0 ? (
                <>
                  <div
                    className="overflow-hidden bg-bg-secondary"
                    style={{ borderRadius: "16px", aspectRatio: "4/3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0]}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {product.images.slice(1, 5).map((img, i) => (
                        <div
                          key={i}
                          className="shrink-0 w-20 h-20 overflow-hidden bg-bg-secondary"
                          style={{ borderRadius: "10px", border: "1px solid #D8DDE1" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`${name} ${i + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="bg-bg-secondary flex items-center justify-center"
                  style={{ borderRadius: "16px", aspectRatio: "4/3" }}
                >
                  <p className="text-muted/50 text-sm">Bez fotografije</p>
                </div>
              )}
            </div>
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
                <ContactModalTrigger variant="primary" size="lg" className="w-full sm:w-auto justify-center">
                  {t("inquiry")}
                </ContactModalTrigger>
              </div>

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
