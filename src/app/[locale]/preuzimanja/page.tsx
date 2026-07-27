import { getTranslations } from "next-intl/server";
import { getDownloads } from "@/lib/queries";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { FileDown } from "lucide-react";
import type { Locale } from "@/lib/types";
import { localized } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "downloads" });
  return { title: t("title") };
}

export default async function PreuzimanjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "downloads" });
  const downloads = await getDownloads();

  return (
    <div className="bg-bg section-lg">
      <div className="container-page">
        <FadeIn className="mb-12">
          <h1 className="text-4xl font-bold text-ink tracking-tight mb-3">{t("title")}</h1>
          <p className="text-muted text-lg">{t("subtitle")}</p>
        </FadeIn>

        {downloads.length === 0 ? (
          <p className="text-muted text-center py-16">{t("noDownloads")}</p>
        ) : (
          <div className="space-y-3">
            {downloads.map((dl, i) => {
              const name = localized(dl, locale as Locale);
              const categoryName = dl.category
                ? localized(dl.category, locale as Locale)
                : null;

              return (
                <FadeIn key={dl.id} delay={i * 0.04}>
                  <div
                    className="bg-white border border-line px-5 py-4 flex items-center justify-between gap-4 hover:border-petrol/40 transition-colors"
                    style={{ borderRadius: "10px" }}
                  >
                    <div className="flex items-center gap-3">
                      <FileDown size={18} strokeWidth={1.5} className="text-petrol shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-ink">{name}</p>
                        {categoryName && (
                          <p className="text-xs text-muted mt-0.5">{categoryName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-xs font-semibold text-muted border border-line px-2 py-0.5 uppercase"
                        style={{ borderRadius: "6px" }}
                      >
                        {dl.language === "all" ? "PDF" : dl.language.toUpperCase()}
                      </span>
                      <a
                        href={dl.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-petrol hover:text-cyan transition-colors"
                      >
                        {t("download")}
                      </a>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
