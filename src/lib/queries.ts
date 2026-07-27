import { createClient } from "@/lib/supabase/server";
import { SETTINGS_ID } from "@/lib/constants";
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
    id: "static-ormarcici", name_hr: "Ormarići", name_sl: "Omarice", name_en: "Cabinets",
    slug: "ormarcici", icon: "Columns3", localImage: "/images/categories/ormarcici.jpg",
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

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .not("parent_id", "is", null)
    .order("sort_order", { ascending: true });

  return data && data.length > 0 ? (data as unknown as Category[]) : STATIC_CATEGORIES;
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .order("sort_order", { ascending: true });

  return (data as unknown as Category[]) ?? [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<(Category & { subcategories: Category[]; products: Product[] }) | null> {
  const supabase = await createClient();
  const { data: categoryRaw } = await supabase
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (!categoryRaw) return null;
  const category = categoryRaw as unknown as Category;

  const [{ data: subcategories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name_hr, name_sl, name_en, slug, icon, sortOrder:sort_order")
      .eq("parent_id", category.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name_hr, name_sl, name_en, slug, images, price_range, featured")
      .eq("category_id", category.id)
      .order("name_hr", { ascending: true }),
  ]);

  return {
    ...category,
    subcategories: (subcategories as unknown as Category[]) ?? [],
    products: (products as unknown as Product[]) ?? [],
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name_hr, name_sl, name_en, slug, description_hr, description_sl, description_en, " +
        "images, specs, price_range, featured, categoryId:category_id, " +
        "category:categories(id, name_hr, name_sl, name_en, slug)"
    )
    .eq("slug", slug)
    .maybeSingle();

  return data as unknown as Product | null;
}

export async function getTeam(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("id, name, role_hr, role_sl, role_en, photoUrl:photo_url, bio_hr, sortOrder:sort_order")
    .order("sort_order", { ascending: true });

  return (data as unknown as TeamMember[]) ?? [];
}

export async function getDownloads(): Promise<Download[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("downloads")
    .select(
      "id, name_hr, name_sl, name_en, fileUrl:file_url, language, " +
        "category:categories(id, name_hr, name_sl, name_en)"
    )
    .order("sort_order", { ascending: true });

  return (data as unknown as Download[]) ?? [];
}

export async function getSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select(
      "siteName:site_name, logoUrl:logo_url, heroImageUrl:hero_image_url, phone, email, address, " +
        "mapUrl:map_url, facebook, instagram, linkedin, youtube, " +
        "footerText_hr:footer_text_hr, footerText_sl:footer_text_sl, footerText_en:footer_text_en"
    )
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  return data as unknown as SiteSettings | null;
}
