import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { InquiryListView } from "./inquiry-list-view";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "inquiry" });
  // The list lives in the visitor's browser, so there is nothing here to index.
  return { title: t("listTitle"), robots: { index: false } };
}

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "inquiry" });

  return (
    <div className="bg-bg section-lg">
      <div className="container-page">
        <FadeIn className="mb-12">
          <h1 className="text-4xl font-bold text-ink tracking-tight mb-3">{t("listTitle")}</h1>
          <p className="text-muted text-lg">{t("listSubtitle")}</p>
        </FadeIn>

        <InquiryListView />
      </div>
    </div>
  );
}
