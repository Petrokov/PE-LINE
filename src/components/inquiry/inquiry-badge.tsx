"use client";

import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";
import { Link } from "@/lib/navigation";
import { useInquiryList } from "@/lib/inquiry-list";

export function InquiryBadge() {
  const t = useTranslations("inquiry");
  const { totalQuantity } = useInquiryList();
  const label = t("listTitle");

  return (
    <Link
      href="/upit"
      aria-label={totalQuantity > 0 ? `${label} (${totalQuantity})` : label}
      title={label}
      className="relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-bg-secondary transition-colors"
    >
      <ClipboardList size={17} strokeWidth={1.5} />
      {totalQuantity > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-champagne text-white text-[10px] font-bold leading-[18px] text-center tabular-nums">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}
