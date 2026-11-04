import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  PRODUCTS_PER_PAGE,
  getAllProducts,
  getCategories,
  getCategoryPreviews,
  getProductCounts,
  getTypeCounts,
} from "@/lib/queries";
import { parseTypes } from "@/lib/product-types";
import { ProductCard } from "@/components/products/product-card";
import { CategoryFilter } from "@/components/products/category-filter";
import { TypeFilter } from "@/components/products/type-filter";
import { Pagination } from "@/components/products/pagination";
import { ProductsHero } from "@/components/products/products-hero";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { localized } from "@/lib/types";
import { localeAlternates } from "@/lib/seo";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "products" });
  const categories = await getCategories();
  const names = categories.map((c) => localized(c, locale as Locale)).join(", ");

  // The filtered listing repeats the category page, so it points there; search
  // results are not worth indexing; other pages of the listing are their own URL.
  const category = categories.find((c) => c.slug === firstParam(query.kategorija));
  const page = Number.parseInt(firstParam(query.stranica) ?? "1", 10) || 1;
  const path = category
    ? `/proizvodi/${category.slug}`
    : page > 1
      ? `/proizvodi?stranica=${page}`
      : "/proizvodi";

  return {
    title: t("title"),
    description: t("metaDescription", { categories: names }),
    alternates: localeAlternates(locale, path),
    ...(firstParam(query.trazi) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProizvodiPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "products" });
  const query = await searchParams;

  const [categories, counts, previews] = await Promise.all([
    getCategories(),
    getProductCounts(),
    getCategoryPreviews(),
  ]);
  // An unknown slug in the URL falls back to the unfiltered listing.
  const activeCategory = categories.find((c) => c.slug === firstParam(query.kategorija));
  const requestedPage = Number.parseInt(firstParam(query.stranica) ?? "1", 10) || 1;
  // Capped so a pasted wall of text cannot turn into an expensive comparison.
  const search = firstParam(query.trazi)?.trim().slice(0, 100) || undefined;
  // Types only mean something inside a category; unknown keys are dropped.
  const types = parseTypes(activeCategory?.slug, firstParam(query.vrsta));

  const [products, typeCounts] = await Promise.all([
    getAllProducts({ categoryId: activeCategory?.id, types, search, page: requestedPage }),
    activeCategory ? getTypeCounts(activeCategory.id) : Promise.resolve({}),
  ]);
  if (products.page > products.pageCount) notFound();

  const filterOptions = categories
    .filter((c) => (counts[c.id] ?? 0) > 0)
    .map((c) => ({ slug: c.slug, name: localized(c, locale as Locale), count: counts[c.id] }));
  const firstShown = (products.page - 1) * PRODUCTS_PER_PAGE + 1;
  const lastShown = Math.min(products.page * PRODUCTS_PER_PAGE, products.total);

  return (
    <div className="bg-bg">
      <ProductsHero categories={categories} previews={previews} locale={locale as Locale} />

      {/* Full assortment right below the hero */}
      <section id="svi-proizvodi" className="container-page pt-12 md:pt-16 pb-24 scroll-mt-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
          <h2
            className="font-black text-ink tracking-[-0.03em] leading-[1.05]"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            {t("allProducts")}
          </h2>
          {products.total > 0 && (
            <p className="text-sm text-muted">
              {t("shownRange", { first: firstShown, last: lastShown, total: products.total })}
            </p>
          )}
        </div>

        <CategoryFilter
          options={filterOptions}
          active={activeCategory?.slug}
          search={search}
          types={types}
        />

        {activeCategory && (
          <TypeFilter
            categorySlug={activeCategory.slug}
            counts={typeCounts}
            active={types}
            pathname="/proizvodi"
            query={{ kategorija: activeCategory.slug, trazi: search }}
            locale={locale}
          />
        )}

        {products.items.length === 0 ? (
          <p className="text-muted text-center py-16">
            {search ? t("noSearchResults", { search }) : t("noProducts")}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale as Locale}
                  categorySlug={product.category?.slug ?? ""}
                />
              ))}
            </div>
            <Pagination
              page={products.page}
              pageCount={products.pageCount}
              category={activeCategory?.slug}
              types={types}
              search={search}
              locale={locale}
            />
          </>
        )}
      </section>
    </div>
  );
}
