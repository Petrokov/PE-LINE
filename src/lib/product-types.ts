/**
 * Product types per category, in the order the filter shows them. Keys are
 * stored in products.product_type and used in the URL (?vrsta=koljena,cijevi);
 * labels live in messages under "productTypes". A category missing here (or
 * with a single type) shows no type filter.
 */
export const PRODUCT_TYPES: Record<string, readonly string[]> = {
  dimovodi: ["cijevi", "koljena", "t-komadi", "setovi", "fleksibilne-cijevi", "obujmice-rozete", "pribor"],
  "podno-grijanje": [
    "cijevi",
    "razdjelnici",
    "ploce",
    "grijace-mreze",
    "termopogoni",
    "bazne-jedinice",
    "alati-pribor",
  ],
  ormarici: ["podesivi", "standardni", "slim-80", "slim-110"],
  radijatori: ["bocni-prikljucak", "srednji-prikljucak"],
  instalacije: ["mijesajuci-ventili", "pogoni", "kuglasti-ventili", "razdjelnici", "ostalo"],
  spremnici: ["spremnici-tople-vode", "medjuspremnici", "grijaci"],
  ventilokonvektori: ["ventilokonvektori", "regulacija", "pribor"],
  regulacije: ["zicani", "bezicni", "wifi"],
};

/** The `?vrsta=` value as known type keys of the category; anything else is dropped. */
export function parseTypes(categorySlug: string | undefined, raw: string | undefined): string[] {
  const known = categorySlug ? PRODUCT_TYPES[categorySlug] : undefined;
  if (!known || !raw) return [];
  const wanted = new Set(raw.split(",").map((s) => s.trim()));
  return known.filter((key) => wanted.has(key));
}
