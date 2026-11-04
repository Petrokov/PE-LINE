import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/lib/navigation";

interface PaginationProps {
  page: number;
  pageCount: number;
  /** Active category filter and search, kept while paging. */
  category?: string;
  types?: string[];
  search?: string;
  locale: string;
}

/**
 * Link-based pager: the page lives in the URL (`?stranica=3`), so a listing
 * stays shareable and works without JavaScript. Links jump back to the top of
 * the listing rather than the top of the page.
 */
export async function Pagination({ page, pageCount, category, types = [], search, locale }: PaginationProps) {
  if (pageCount <= 1) return null;
  const t = await getTranslations({ locale, namespace: "products" });

  const hrefFor = (target: number) => {
    const query: Record<string, string> = {};
    if (category) query.kategorija = category;
    if (types.length) query.vrsta = types.join(",");
    if (search) query.trazi = search;
    if (target > 1) query.stranica = String(target);
    return { pathname: "/proizvodi", query, hash: "svi-proizvodi" };
  };

  // First, last, current and its neighbours; gaps collapse into an ellipsis.
  const shown = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const numbers = [...shown].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);

  const itemClasses =
    "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors";
  const linkClasses = `${itemClasses} border-line bg-white text-ink hover:border-petrol`;

  return (
    <nav aria-label={t("pagesLabel")} className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" aria-label={t("prevPage")} className={linkClasses}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>
      ) : null}

      {numbers.map((number, index) => {
        const previous = numbers[index - 1];
        const gap = previous !== undefined && number - previous > 1;
        return (
          <span key={number} className="flex items-center gap-2">
            {gap ? <span className="px-1 text-sm text-muted/60">…</span> : null}
            {number === page ? (
              <span aria-current="page" className={`${itemClasses} border-petrol bg-petrol text-white`}>
                {number}
              </span>
            ) : (
              <Link href={hrefFor(number)} className={linkClasses}>
                {number}
              </Link>
            )}
          </span>
        );
      })}

      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" aria-label={t("nextPage")} className={linkClasses}>
          <ChevronRight size={16} strokeWidth={1.5} />
        </Link>
      ) : null}
    </nav>
  );
}
