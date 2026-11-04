import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import type { Locale } from "@/lib/types";
import type { RelatedPoolItem } from "@/lib/queries";

interface RelatedProductsProps {
  id: string;
  title: string;
  subtitle: string;
  products: RelatedPoolItem[];
  locale: Locale;
}

/** A row of product cards under the product details; scrolls sideways on phones. */
export function RelatedProducts({ id, title, subtitle, products, locale }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby={id} className="mt-20">
      <FadeIn className="mb-8">
        <h2 id={id} className="text-2xl font-bold text-ink tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-muted">{subtitle}</p>
      </FadeIn>
      <ul
        className="-mx-4 px-4 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {products.map((product, i) => (
          <li key={product.id} className="shrink-0 w-[78%] snap-start sm:w-auto">
            <FadeIn delay={Math.min(i, 4) * 0.06} className="h-full">
              <ProductCard product={product} locale={locale} categorySlug={product.categorySlug} />
            </FadeIn>
          </li>
        ))}
      </ul>
    </section>
  );
}
