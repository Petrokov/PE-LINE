import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ProductCarousel } from "@/components/products/product-carousel";
import type { Locale } from "@/lib/types";
import type { RelatedPoolItem } from "@/lib/queries";

interface RelatedProductsProps {
  id: string;
  title: string;
  subtitle: string;
  products: RelatedPoolItem[];
  locale: Locale;
}

/** A carousel of product cards under the product details. */
export function RelatedProducts({ id, title, subtitle, products, locale }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby={id} className="mt-20">
      <ProductCarousel
        labelledBy={id}
        header={
          <>
            <h2 id={id} className="text-2xl font-bold text-ink tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-muted">{subtitle}</p>
          </>
        }
      >
        {products.map((product, i) => (
          <li key={product.id} className="shrink-0 select-none w-[78%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]">
            <FadeIn delay={Math.min(i, 4) * 0.06} className="h-full">
              <ProductCard product={product} locale={locale} categorySlug={product.categorySlug} />
            </FadeIn>
          </li>
        ))}
      </ProductCarousel>
    </section>
  );
}
