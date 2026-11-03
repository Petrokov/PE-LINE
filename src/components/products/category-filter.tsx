"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Search, X } from "lucide-react";
import { Link, useRouter } from "@/lib/navigation";

interface CategoryFilterProps {
  options: Array<{ slug: string; name: string; count: number }>;
  active?: string;
  search?: string;
}

/**
 * Category filter and search above the full product listing. Both live in the
 * URL (`?kategorija=radijatori&trazi=ventil`), so a filtered listing is
 * shareable and the server does the filtering. The search is a real GET form,
 * so it also works without JavaScript.
 */
export function CategoryFilter({ options, active, search }: CategoryFilterProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Changing either filter always returns to page one; an old page number
  // would often land past the end of the shorter result set.
  function go(next: { kategorija?: string; trazi?: string }) {
    const query: Record<string, string> = {};
    if (next.kategorija) query.kategorija = next.kategorija;
    if (next.trazi) query.trazi = next.trazi;
    startTransition(() => router.push({ pathname: "/proizvodi", query }, { scroll: false }));
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <label htmlFor="category-filter" className="text-sm font-semibold text-muted">
        {t("filterLabel")}
      </label>

      <div className="relative">
        <select
          // Uncontrolled, so remount it when the URL changes the active category
          // (the "Clear" link, back/forward) or it keeps the old value.
          key={active ?? ""}
          id="category-filter"
          defaultValue={active ?? ""}
          onChange={(event) => go({ kategorija: event.target.value, trazi: search })}
          disabled={isPending}
          className="h-10 max-w-[18rem] appearance-none truncate rounded-full border border-line bg-white py-0 pl-4 pr-10 text-sm font-semibold text-ink transition-colors hover:border-petrol focus:outline-none focus:border-petrol disabled:opacity-60 cursor-pointer"
        >
          <option value="">{t("filterAll")}</option>
          {options.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.name} ({option.count})
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          strokeWidth={1.5}
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>

      <form
        role="search"
        method="get"
        className="relative w-full sm:w-auto sm:min-w-[18rem]"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("trazi");
          go({ kategorija: active, trazi: typeof value === "string" ? value.trim() : "" });
        }}
      >
        {/* Keeps the category when the form is sent without JavaScript. */}
        {active ? <input type="hidden" name="kategorija" value={active} /> : null}
        <label htmlFor="product-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <input
          // Remount on URL changes (the "Clear" link, back/forward), like the select.
          key={search ?? ""}
          id="product-search"
          name="trazi"
          type="search"
          defaultValue={search ?? ""}
          placeholder={t("searchPlaceholder")}
          disabled={isPending}
          className="h-10 w-full rounded-full border border-line bg-white py-0 pl-4 pr-11 text-sm text-ink placeholder:text-muted/60 transition-colors hover:border-petrol focus:outline-none focus:border-petrol disabled:opacity-60"
        />
        <button
          type="submit"
          aria-label={t("searchSubmit")}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
        >
          <Search size={15} strokeWidth={1.5} />
        </button>
      </form>

      {active || search ? (
        <Link
          href="/proizvodi#svi-proizvodi"
          scroll={false}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-muted transition-colors hover:border-petrol hover:text-ink"
        >
          <X size={14} strokeWidth={1.5} aria-hidden />
          {t("filterClear")}
        </Link>
      ) : null}
    </div>
  );
}
