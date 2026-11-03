export type Locale = "hr" | "sl" | "en";

export type LocalizedDoc = {
  name_hr: string;
  name_sl?: string | null;
  name_en?: string | null;
};

export function localized(obj: LocalizedDoc, locale: Locale): string {
  if (locale === "sl" && obj.name_sl) return obj.name_sl;
  if (locale === "en" && obj.name_en) return obj.name_en;
  return obj.name_hr;
}

export type Category = LocalizedDoc & {
  id: string;
  slug: string;
  icon?: string | null;
  heroImageUrl?: string | null;
  localImage?: string;
  description_hr?: string | null;
  description_sl?: string | null;
  description_en?: string | null;
  sortOrder: number;
  parentId?: string | null;
};

export type Product = LocalizedDoc & {
  id: string;
  slug: string;
  images: string[];
  price_range?: string | null;
  featured: boolean;
  specs: Array<{ key: string; value: string }>;
  categoryId?: string;
  category?: Pick<Category, "id" | "name_hr" | "name_sl" | "name_en" | "slug">;
  description_hr?: string | null;
  description_sl?: string | null;
  description_en?: string | null;
  /** Raw B2B description from SAP; shown when no hand-written description is set. */
  sap_description?: string | null;
  /** Raw SAP article name; name_hr is the edited web name. */
  sap_name?: string | null;
  unit?: string | null;
};

export type GalleryImage = {
  id: string;
  imageUrl: string;
  alt_hr?: string | null;
  caption_hr?: string | null;
  sortOrder: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role_hr?: string | null;
  role_sl?: string | null;
  role_en?: string | null;
  photoUrl?: string | null;
  bio_hr?: string | null;
  sortOrder: number;
};

export type Download = LocalizedDoc & {
  id: string;
  fileUrl: string;
  language: "hr" | "sl" | "en" | "all";
  category?: Pick<Category, "id" | "name_hr" | "name_sl" | "name_en"> | null;
  sortOrder?: number;
};

export type SiteSettings = {
  siteName?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  mapUrl?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  footerText_hr?: string | null;
  footerText_sl?: string | null;
  footerText_en?: string | null;
};
