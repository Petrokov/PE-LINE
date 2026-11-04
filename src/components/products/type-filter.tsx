import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { Link } from "@/lib/navigation";
import { PRODUCT_TYPES } from "@/lib/product-types";

interface TypeFilterProps {
  categorySlug: string;
  /** Active product count per type key in this category. */
  counts: Record<string, number>;
  /** Type keys currently selected. */
  active: string[];
  /** Page the chips link to: the full listing or the category page. */
  pathname: string;
  /** Other query params to keep (category, search); the page number is always dropped. */
  query?: Record<string, string | undefined>;
  locale: string;
}

/**
 * Product type chips for one category; several can be on at once. Each chip is
 * a plain link to the listing with that type toggled (`?vrsta=koljena,cijevi`),
 * so the filter works without JavaScript and the result can be shared.
 */
export async function TypeFilter({ categorySlug, counts, active, pathname, query = {}, locale }: TypeFilterProps) {
  const t = await getTranslations({ locale, namespace: "productTypes" });
  const tProducts = await getTranslations({ locale, namespace: "products" });
  const options = (PRODUCT_TYPES[categorySlug] ?? []).filter((key) => (counts[key] ?? 0) > 0);
  if (options.length < 2) return null;

  const hrefFor = (types: string[]) => {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) if (value) next[key] = value;
    if (types.length) next.vrsta = types.join(",");
    return { pathname, query: next, hash: "svi-proizvodi" };
  };
  const toggle = (key: string) =>
    // Kept in the category's own order, so the URL is the same however it was clicked.
    options.filter((k) => (k === key ? !active.includes(k) : active.includes(k)));

  const chip =
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors whitespace-nowrap";

  return (
    <nav aria-label={tProducts("typeFilterLabel")} className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 overflow-x-auto scrollbar-hide sm:flex-wrap pb-1">
        <li>
          <Link
            href={hrefFor([])}
            scroll={false}
            aria-current={active.length === 0 ? "true" : undefined}
            className={`${chip} ${
              active.length === 0
                ? "border-petrol bg-petrol text-white"
                : "border-line bg-white text-ink hover:border-petrol"
            }`}
          >
            {tProducts("typeAll")}
          </Link>
        </li>
        {options.map((key) => {
          const on = active.includes(key);
          return (
            <li key={key}>
              <Link
                href={hrefFor(toggle(key))}
                scroll={false}
                aria-current={on ? "true" : undefined}
                className={`${chip} ${
                  on ? "border-petrol bg-petrol/10 text-petrol" : "border-line bg-white text-ink hover:border-petrol"
                }`}
              >
                {on && <Check size={14} strokeWidth={2} aria-hidden />}
                {t(key)}
                <span className={`tabular-nums text-xs ${on ? "text-petrol/70" : "text-muted"}`}>{counts[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
