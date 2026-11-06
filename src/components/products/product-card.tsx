"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { useState } from "react";
import { ArrowRight, Check, ClipboardList, Send } from "lucide-react";
import type { Product, Locale } from "@/lib/types";
import { localized } from "@/lib/types";
import { useContactModal } from "@/components/contact/contact-modal-context";
import { addToInquiryList, setInquiryQuantity, useInquiryListQuantity } from "@/lib/inquiry-list";
import { QuantityStepper } from "@/components/inquiry/quantity-stepper";
import { productThumbUrl } from "@/lib/product-images";

interface ProductCardProps {
  product: Product;
  locale: Locale;
  categorySlug: string;
}

export function ProductCard({ product, locale, categorySlug }: ProductCardProps) {
  const t = useTranslations("products");
  const tInquiry = useTranslations("inquiry");
  const { open } = useContactModal();
  const name = localized(product, locale);
  const image = productThumbUrl(product.images?.[0]);
  const listedQty = useInquiryListQuantity(product.slug);
  const added = listedQty > 0;
  // Same behaviour as the product page: the stepper picks the amount to add,
  // and once listed it edits the quantity already on the inquiry list.
  const [draftQty, setDraftQty] = useState(1);
  const qty = added ? listedQty : draftQty;

  return (
    <div className="group h-full">
      {/* Outer shell — double bezel */}
      <div
        className="rounded-2xl p-[5px] border h-full transition-all duration-500"
        style={{
          background: "rgba(232,226,216,0.35)",
          borderColor: "rgba(216,221,225,0.75)",
          boxShadow: "0 8px 32px rgba(29,35,41,0.05)",
          transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(14,79,95,0.35)";
          el.style.boxShadow = "0 24px 64px rgba(29,35,41,0.12)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(216,221,225,0.75)";
          el.style.boxShadow = "0 8px 32px rgba(29,35,41,0.05)";
        }}
      >
        {/* Inner core */}
        <div
          className="rounded-[calc(1rem-0.25rem)] bg-white overflow-hidden flex flex-col h-full"
          style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.95)" }}
        >
          {/* Image and title link to the product; the inquiry buttons sit outside the link. */}
          <Link href={`/proizvodi/${categorySlug}/${product.slug}`} className="flex flex-col flex-1">
            {/* Slika */}
            {/* White, not grey: product shots are cut out on white, so a tinted
                tile would show each photo's own background as a square. */}
            <div
              className={`relative overflow-hidden ${image ? "bg-white" : "bg-bg-secondary"}`}
              style={{ aspectRatio: "4/3" }}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={name}
                  loading="lazy"
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-muted/40">
                      <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
              {product.featured && (
                <span
                  className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-champagne text-white"
                  style={{ borderRadius: "6px" }}
                >
                  {t("featuredBadge")}
                </span>
              )}
            </div>

            {/* Sadržaj */}
            <div className="p-4 pb-3 flex flex-col flex-1">
              <h3 className="text-sm font-semibold text-ink leading-snug mb-2">{name}</h3>

              {product.price_range && (
                <p className="text-xs font-spec text-champagne font-medium mb-3">
                  {product.price_range}
                </p>
              )}

              <div className="flex items-center gap-1 text-xs font-medium text-petrol group-hover:text-cyan transition-colors mt-auto">
                {t("moreInfo")}
                <ArrowRight size={12} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          <div className="px-4 pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <QuantityStepper
                value={qty}
                itemLabel={name}
                onChange={(next) => (added ? setInquiryQuantity(product.slug, next) : setDraftQty(next))}
                className="h-9"
              />
              <button
                type="button"
                disabled={added}
                onClick={() =>
                  addToInquiryList({ slug: product.slug, categorySlug, title: name, imageUrl: image ?? "" }, draftQty)
                }
                aria-label={added ? tInquiry("addedAria", { name }) : tInquiry("addAria", { name })}
                className="flex h-9 flex-1 min-w-0 items-center justify-center gap-1.5 rounded-full border border-line bg-white px-2 text-xs font-semibold text-ink whitespace-nowrap transition-colors hover:border-petrol disabled:cursor-default disabled:border-champagne disabled:text-champagne active:scale-[0.98] cursor-pointer"
              >
                {added ? <Check size={14} strokeWidth={1.5} /> : <ClipboardList size={14} strokeWidth={1.5} />}
                {added ? tInquiry("added") : tInquiry("add")}
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                open(`${tInquiry("prefillIntro")}
${tInquiry("prefillLine", { name, qty })}

`)
              }
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-petrol text-xs font-semibold text-white transition-colors hover:bg-petrol-dark active:scale-[0.98] cursor-pointer"
            >
              <Send size={13} strokeWidth={1.5} />
              {tInquiry("sendNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
