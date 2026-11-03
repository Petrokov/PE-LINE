"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ClipboardList, Send } from "lucide-react";
import { Link } from "@/lib/navigation";
import { useContactModal } from "@/components/contact/contact-modal-context";
import { addToInquiryList, setInquiryQuantity, useInquiryListQuantity } from "@/lib/inquiry-list";
import { QuantityStepper } from "./quantity-stepper";

interface ProductInquiryActionsProps {
  slug: string;
  categorySlug: string;
  title: string;
  imageUrl: string;
}

export function ProductInquiryActions({ slug, categorySlug, title, imageUrl }: ProductInquiryActionsProps) {
  const t = useTranslations("inquiry");
  const { open } = useContactModal();
  const listedQty = useInquiryListQuantity(slug);
  const added = listedQty > 0;
  // Before the product is on the list the stepper picks how many to add;
  // afterwards it edits the quantity already on the list.
  const [draftQty, setDraftQty] = useState(1);
  const qty = added ? listedQty : draftQty;

  return (
    <div className="space-y-3">
      {/* Buttons drop to their own row when the column is too narrow for all three. */}
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={qty}
          itemLabel={title}
          onChange={(next) => (added ? setInquiryQuantity(slug, next) : setDraftQty(next))}
          className="h-[52px]"
        />
        {/* Sends an inquiry for this product alone, without touching the list. */}
        <button
          type="button"
          onClick={() => open(`${t("prefillIntro")}\n${t("prefillLine", { name: title, qty })}\n\n`)}
          className="flex h-[52px] flex-1 min-w-[180px] whitespace-nowrap items-center justify-center gap-2 rounded-full bg-petrol px-6 text-sm font-semibold text-white transition-colors hover:bg-petrol-dark active:scale-[0.98] cursor-pointer"
        >
          <Send size={15} strokeWidth={1.5} />
          {t("sendNow")}
        </button>
        <button
          type="button"
          disabled={added}
          onClick={() => addToInquiryList({ slug, categorySlug, title, imageUrl }, draftQty)}
          className="flex h-[52px] flex-1 min-w-[180px] whitespace-nowrap items-center justify-center gap-2 rounded-full border border-line bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-petrol disabled:cursor-default disabled:border-champagne disabled:text-champagne active:scale-[0.98] cursor-pointer"
        >
          {added ? <Check size={15} strokeWidth={1.5} /> : <ClipboardList size={15} strokeWidth={1.5} />}
          {added ? t("added") : t("add")}
        </button>
      </div>
      {added && (
        <Link href="/upit" className="inline-block text-sm font-medium text-petrol hover:text-cyan transition-colors">
          {t("viewList")} →
        </Link>
      )}
    </div>
  );
}
