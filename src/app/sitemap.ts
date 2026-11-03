import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCategories, getSitemapProducts } from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";

// Rebuilt at most hourly, like the pages it lists.
export const revalidate = 3600;

/** One entry per locale, each listing its language siblings (hreflang). */
function localized(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> = {}
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getSitemapProducts()]);

  return [
    ...localized("", { changeFrequency: "weekly", priority: 1 }),
    ...localized("/proizvodi", { changeFrequency: "weekly", priority: 0.9 }),
    ...localized("/o-nama", { changeFrequency: "monthly", priority: 0.5 }),
    ...localized("/preuzimanja", { changeFrequency: "monthly", priority: 0.5 }),
    ...categories.flatMap((category) =>
      localized(`/proizvodi/${category.slug}`, { changeFrequency: "weekly", priority: 0.8 })
    ),
    ...products.flatMap((product) =>
      localized(`/proizvodi/${product.categorySlug}/${product.slug}`, {
        lastModified: product.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    ),
  ];
}
