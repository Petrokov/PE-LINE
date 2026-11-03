import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { SETTINGS_ID } from "@/lib/constants";
import { STATIC_PRODUCTS } from "@/lib/static-products";
import type { Category, Product, TeamMember, Download, SiteSettings } from "@/lib/types";

const CATEGORY_COLUMNS =
  "id, name_hr, name_sl, name_en, slug, icon, heroImageUrl:hero_image_url, " +
  "description_hr, description_sl, description_en, sortOrder:sort_order, parentId:parent_id";

const STATIC_CATEGORIES: Category[] = [
  {
    id: "static-dimovodi", name_hr: "Dimovodi", name_sl: "Dimovodi", name_en: "Flue pipes",
    slug: "dimovodi", icon: "Flame", localImage: "/images/categories/dimovodi.jpg",
    description_hr: "Dimovodne cijevi i spojni elementi za sigurno odvođenje dimnih plinova.",
    description_sl: "Dimovodne cevi in spojni elementi za varno odvajanje dimnih plinov.",
    description_en: "Flue pipes and connectors for safe exhaust of combustion gases.",
    sortOrder: 1,
  },
  {
    id: "static-ormarici", name_hr: "Ormarići", name_sl: "Omarice", name_en: "Cabinets",
    slug: "ormarici", icon: "Columns3", localImage: "/images/categories/ormarcici.jpg",
    description_hr: "Razdjelni ormarići za podno grijanje i instalacijske sustave.",
    description_sl: "Razdelilne omarice za talno ogrevanje in instalacijske sisteme.",
    description_en: "Distribution cabinets for underfloor heating and installation systems.",
    sortOrder: 2,
  },
  {
    id: "static-podno-grijanje", name_hr: "Podno grijanje", name_sl: "Talno ogrevanje", name_en: "Underfloor heating",
    slug: "podno-grijanje", icon: "Layers", localImage: "/images/categories/podno-grijanje.jpg",
    description_hr: "Sustavi podnog grijanja za ravnomjernu raspodjelu topline po cijeloj prostoriji.",
    description_sl: "Sistemi talnega ogrevanja za enakomerno razporeditev toplote po celotnem prostoru.",
    description_en: "Underfloor heating systems for even heat distribution across the entire room.",
    sortOrder: 3,
  },
  {
    id: "static-radijatori", name_hr: "Radijatori", name_sl: "Radiatorji", name_en: "Radiators",
    slug: "radijatori", icon: "Thermometer", localImage: "/images/categories/radijatori.jpg",
    description_hr: "Panelni i dekorativni radijatori za učinkovito grijanje svakog prostora.",
    description_sl: "Panelni in dekorativni radiatorji za učinkovito ogrevanje vsakega prostora.",
    description_en: "Panel and decorative radiators for efficient heating of every space.",
    sortOrder: 4,
  },
  {
    id: "static-regulacije", name_hr: "Regulacije", name_sl: "Regulacije", name_en: "Controls",
    slug: "regulacije", icon: "Settings", localImage: "/images/categories/regulacije.jpg",
    description_hr: "Termostati, regulatori i pametni sustavi upravljanja grijanjem i hlađenjem.",
    description_sl: "Termostati, regulatorji in pametni sistemi upravljanja ogrevanjem in hlajenjem.",
    description_en: "Thermostats, controllers and smart systems for heating and cooling management.",
    sortOrder: 5,
  },
  {
    id: "static-spremnici", name_hr: "Spremnici", name_sl: "Zbiralniki", name_en: "Tanks",
    slug: "spremnici", icon: "Box", localImage: "/images/categories/spremnici.jpg",
    description_hr: "Pufer i akumulacijski spremnici za pohranu toplinske energije.",
    description_sl: "Pufer in akumulacijski zbiralniki za shranjevanje toplotne energije.",
    description_en: "Buffer and accumulation tanks for thermal energy storage.",
    sortOrder: 6,
  },
  {
    id: "static-ventilokonvektori", name_hr: "Ventilokonvektori", name_sl: "Ventilatorski konvektorji", name_en: "Fan coil units",
    slug: "ventilokonvektori", icon: "Wind", localImage: "/images/categories/ventilokonvektori.jpg",
    description_hr: "Ventilokonvektori za grijanje i hlađenje — tihi, učinkoviti i diskretni.",
    description_sl: "Ventilatorski konvektorji za ogrevanje in hlajenje — tihi, učinkoviti in diskretni.",
    description_en: "Fan coil units for heating and cooling — quiet, efficient and discreet.",
    sortOrder: 7,
  },
];

// Throw on query errors so ISR keeps serving the last good page instead of caching a degraded one.
function unwrap({ data, error }: { data: unknown; error: { message: string } | null }) {
  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return data;
}

// Display products from STATIC_PRODUCTS, used only while a category has no real products.
function getStaticProducts(category: Category): Product[] {
  return (STATIC_PRODUCTS[category.slug] ?? []).map((product) => ({
    ...product,
    id: `static-${product.slug}`,
    featured: false,
    categoryId: category.id,
    category: {
      id: category.id,
      name_hr: category.name_hr,
      name_sl: category.name_sl,
      name_en: category.name_en,
      slug: category.slug,
    },
  }));
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const data = unwrap(
    await supabase
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .not("parent_id", "is", null)
      .order("sort_order", { ascending: true })
  ) as Category[] | null;

  return data && data.length > 0 ? data : STATIC_CATEGORIES;
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const data = unwrap(
    await supabase
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .order("sort_order", { ascending: true })
  ) as Category[] | null;

  return data ?? [];
}

// cache(): the category page's metadata and body ask for the same category in one render.
export const getCategoryBySlug = cache(async function getCategoryBySlug(
  slug: string
): Promise<(Category & { subcategories: Category[]; products: Product[] }) | null> {
  const supabase = createPublicClient();
  const category = unwrap(
    await supabase
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .eq("slug", slug)
      .maybeSingle()
  ) as Category | null;

  if (!category) return null;

  const [subcategoriesRes, productsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name_hr, name_sl, name_en, slug, icon, sortOrder:sort_order")
      .eq("parent_id", category.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name_hr, name_sl, name_en, slug, images, price_range, featured")
      .eq("category_id", category.id)
      .eq("active", true)
      .order("name_hr", { ascending: true }),
  ]);
  const subcategories = unwrap(subcategoriesRes) as Category[] | null;
  const products = unwrap(productsRes) as Product[] | null;

  return {
    ...category,
    subcategories: subcategories ?? [],
    products: products && products.length > 0 ? products : getStaticProducts(category),
  };
});

export const PRODUCTS_PER_PAGE = 24;

export type ProductPage = { items: Product[]; total: number; page: number; pageCount: number };

const LISTING_COLUMNS =
  "id, name_hr, name_sl, name_en, slug, images, price_range, featured, " +
  "category:categories(id, name_hr, name_sl, name_en, slug)";

const SEARCH_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** Lowercase, without diacritics (đ included), so "grijac" finds "GRIJAČ". */
function searchable(value: string) {
  return value.normalize("NFD").replace(SEARCH_DIACRITICS, "").replace(/đ/gi, "d").toLowerCase();
}

/** Catalogue numbers are typed with or without their dashes, dots and spaces. */
function compactCode(value: string) {
  return searchable(value).replace(/[^a-z0-9]/g, "");
}

function matchesSearch(
  product: Pick<Product, "name_hr" | "name_sl" | "name_en" | "sap_name" | "specs">,
  search: string
) {
  const term = searchable(search.trim());
  // The SAP name too, since buyers often type the ERP wording ("EL.KOMBI", "MIŠ VENTIL").
  const names = [product.name_hr, product.name_sl, product.name_en, product.sap_name].filter(Boolean) as string[];
  if (names.some((name) => searchable(name).includes(term))) return true;

  const code = compactCode(search);
  if (!code) return false;
  return (product.specs ?? []).some(
    (spec) => spec.key === "Kataloški broj" && compactCode(spec.value).includes(code)
  );
}

/** One page of every product by name, optionally narrowed to one category and a search term. */
export async function getAllProducts({
  categoryId,
  search,
  page = 1,
  pageSize = PRODUCTS_PER_PAGE,
}: {
  categoryId?: string;
  /** Matches the product name or its catalogue number. */
  search?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<ProductPage> {
  const supabase = createPublicClient();
  const safePage = Math.max(1, Math.trunc(page) || 1);
  const from = (safePage - 1) * pageSize;

  if (search?.trim()) {
    // The catalogue number lives inside the specs JSON, which PostgREST cannot
    // search as text. The catalogue is a few hundred rows, so filter it here.
    let query = supabase
      .from("products")
      .select(`${LISTING_COLUMNS}, specs, sap_name`)
      .eq("active", true)
      .order("name_hr", { ascending: true });
    if (categoryId) query = query.eq("category_id", categoryId);

    const rows = (unwrap(await query) as unknown as Product[] | null) ?? [];
    const matches = rows.filter((product) => matchesSearch(product, search));
    return {
      items: matches.slice(from, from + pageSize),
      total: matches.length,
      page: safePage,
      pageCount: Math.max(1, Math.ceil(matches.length / pageSize)),
    };
  }

  let query = supabase
    .from("products")
    .select(LISTING_COLUMNS, { count: "exact" })
    .eq("active", true)
    .order("name_hr", { ascending: true })
    .range(from, from + pageSize - 1);
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, count, error } = await query;
  // Asking past the last row is a PostgREST error, not an empty page; report it as one.
  if (error && error.code !== "PGRST103") throw new Error(`Supabase query failed: ${error.message}`);

  const total = count ?? 0;
  return {
    items: (data as unknown as Product[] | null) ?? [],
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type CategoryPreview = { count: number; products: Product[] };

/**
 * A few products per category for the products hero, keyed by category id.
 * Products with a photo come first, then by name, so the preview shows the
 * best-presented articles while most imported ones still have no image.
 */
export async function getCategoryPreviews(perCategory = 4): Promise<Record<string, CategoryPreview>> {
  const supabase = createPublicClient();
  const rows =
    (unwrap(
      await supabase
        .from("products")
        .select("id, name_hr, name_sl, name_en, slug, images, featured, specs, categoryId:category_id")
        .eq("active", true)
        .order("name_hr", { ascending: true })
    ) as Product[] | null) ?? [];

  const previews: Record<string, CategoryPreview> = {};
  for (const product of rows) {
    if (!product.categoryId) continue;
    const preview = (previews[product.categoryId] ??= { count: 0, products: [] });
    preview.count += 1;
    preview.products.push(product);
  }
  for (const preview of Object.values(previews)) {
    const rank = (p: Product) => (p.featured ? 0 : 1) + (p.images?.length ? 0 : 2);
    preview.products = preview.products
      .map((product, index) => ({ product, index }))
      .sort((a, b) => rank(a.product) - rank(b.product) || a.index - b.index)
      .slice(0, perCategory)
      .map(({ product }) => product);
  }
  return previews;
}

/** Every active product's URL parts and last change, for the sitemap. */
export async function getSitemapProducts(): Promise<
  Array<{ slug: string; categorySlug: string; updatedAt: string }>
> {
  const supabase = createPublicClient();
  const rows =
    (unwrap(
      await supabase
        .from("products")
        .select("slug, updated_at, category:categories(slug)")
        .eq("active", true)
        .limit(10000)
    ) as unknown as Array<{ slug: string; updated_at: string; category: { slug: string } | null }> | null) ?? [];
  return rows
    .filter((row) => row.category?.slug)
    .map((row) => ({ slug: row.slug, categorySlug: row.category!.slug, updatedAt: row.updated_at }));
}

/** Product count per category id, for the filter's option labels. */
export async function getProductCounts(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  const data = unwrap(
    await supabase.from("categories").select("id, products(count)").eq("products.active", true)
  ) as Array<{ id: string; products: Array<{ count: number }> }> | null;

  return Object.fromEntries((data ?? []).map((row) => [row.id, row.products[0]?.count ?? 0]));
}

// cache(): generateMetadata and the page ask for the same product in one render.
export const getProductBySlug = cache(async function getProductBySlug(
  categorySlug: string,
  slug: string
): Promise<Product | null> {
  const supabase = createPublicClient();
  const product = unwrap(
    await supabase
      .from("products")
      .select(
        "id, name_hr, name_sl, name_en, slug, description_hr, description_sl, description_en, " +
          "images, specs, price_range, featured, categoryId:category_id, sap_description, unit, active, " +
          "category:categories(id, name_hr, name_sl, name_en, slug)"
      )
      .eq("slug", slug)
      .maybeSingle()
  ) as (Product & { active: boolean }) | null;

  // An article withdrawn in SAP keeps its row (and URL) but is no longer shown.
  if (product) return product.active && product.category?.slug === categorySlug ? product : null;

  // Not a real product: resolve it only as a display product the category is currently listing.
  const category = await getCategoryBySlug(categorySlug);
  return category?.products.find((p) => p.slug === slug) ?? null;
});

export async function getTeam(): Promise<TeamMember[]> {
  const supabase = createPublicClient();
  const data = unwrap(
    await supabase
      .from("team_members")
      .select("id, name, role_hr, role_sl, role_en, photoUrl:photo_url, bio_hr, sortOrder:sort_order")
      .order("sort_order", { ascending: true })
  ) as TeamMember[] | null;

  return data ?? [];
}

export async function getDownloads(): Promise<Download[]> {
  const supabase = createPublicClient();
  const data = unwrap(
    await supabase
      .from("downloads")
      .select(
        "id, name_hr, name_sl, name_en, fileUrl:file_url, language, " +
          "category:categories(id, name_hr, name_sl, name_en)"
      )
      .order("sort_order", { ascending: true })
  ) as Download[] | null;

  return data ?? [];
}

export async function getSettings(): Promise<SiteSettings | null> {
  const supabase = createPublicClient();
  return unwrap(
    await supabase
      .from("settings")
      .select(
        "siteName:site_name, logoUrl:logo_url, heroImageUrl:hero_image_url, phone, email, address, " +
          "mapUrl:map_url, facebook, instagram, linkedin, youtube, " +
          "footerText_hr:footer_text_hr, footerText_sl:footer_text_sl, footerText_en:footer_text_en"
      )
      .eq("id", SETTINGS_ID)
      .maybeSingle()
  ) as SiteSettings | null;
}
