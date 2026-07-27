import { Link } from "@/lib/navigation";
import { ArrowRight } from "lucide-react";
import type { Product, Locale } from "@/lib/types";
import { localized } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  locale: Locale;
  categorySlug: string;
}

export function ProductCard({ product, locale, categorySlug }: ProductCardProps) {
  const name = localized(product, locale);
  const image = product.images?.[0];

  return (
    <Link
      href={`/proizvodi/${categorySlug}/${product.slug}`}
      className="group card-interactive block h-full"
    >
      <div
        className="bg-white border border-line overflow-hidden flex flex-col h-full"
        style={{
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(29,35,41,0.08)",
        }}
      >
        {/* Slika */}
        <div className="relative bg-bg-secondary overflow-hidden" style={{ aspectRatio: "4/3" }}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
              Istaknuto
            </span>
          )}
        </div>

        {/* Sadržaj */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-ink leading-snug mb-2">{name}</h3>

          {product.price_range && (
            <p className="text-xs font-spec text-champagne font-medium mb-3">
              {product.price_range}
            </p>
          )}

          <div className="flex items-center gap-1 text-xs font-medium text-petrol group-hover:text-cyan transition-colors mt-auto">
            Više info
            <ArrowRight size={12} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
