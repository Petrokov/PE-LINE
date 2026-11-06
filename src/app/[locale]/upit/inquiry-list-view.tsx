"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/lib/navigation";
import { useInquiryList } from "@/lib/inquiry-list";
import { productThumbUrl } from "@/lib/product-images";
import { QuantityStepper } from "@/components/inquiry/quantity-stepper";
import { ContactForm } from "@/components/contact/contact-form";
import { ButtonLink } from "@/components/ui/button";

export function InquiryListView() {
  const t = useTranslations("inquiry");
  const tContact = useTranslations("contact");
  const { items, remove, clear, setQuantity } = useInquiryList();
  // Clearing the list unmounts the form and its success message, so the page remembers it was sent.
  const [sent, setSent] = useState(false);
  const handleSuccess = useCallback(() => {
    setSent(true);
    clear();
  }, [clear]);

  if (items.length === 0) {
    return (
      <div className="bg-white border border-line p-10 text-center" style={{ borderRadius: "16px" }}>
        <p className={sent ? "text-petrol font-medium mb-6" : "text-muted mb-6"}>
          {sent ? tContact("success") : t("empty")}
        </p>
        <ButtonLink href="/proizvodi" variant="primary">
          {t("browse")}
        </ButtonLink>
      </div>
    );
  }

  const prefillMessage =
    `${t("prefillIntro")}\n` +
    items.map((item) => t("prefillLine", { name: item.title, qty: item.qty })).join("\n") +
    "\n\n";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.slug}
            className="bg-white border border-line p-3 flex items-start gap-4"
            style={{ borderRadius: "12px" }}
          >
            <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-bg-secondary" style={{ borderRadius: "8px" }}>
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={productThumbUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
              {item.categorySlug ? (
                <Link
                  href={`/proizvodi/${item.categorySlug}/${item.slug}`}
                  className="text-sm font-semibold text-ink hover:text-petrol transition-colors"
                >
                  {item.title}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-ink">{item.title}</span>
              )}
              <QuantityStepper
                value={item.qty}
                itemLabel={item.title}
                onChange={(next) => setQuantity(item.slug, next)}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(item.slug)}
              aria-label={t("remove", { name: item.title })}
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-bg transition-colors cursor-pointer"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      <div>
        {/* Remount on every list change so the prefilled message follows the list. */}
        <ContactForm
          key={items.map((item) => `${item.slug}:${item.qty}`).join(",")}
          prefillMessage={prefillMessage}
          items={items.map((item) => ({ slug: item.slug, qty: item.qty }))}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
