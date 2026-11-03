/**
 * Images synced from the SAP share are stored twice (scripts/sap-images.ts):
 * `<index>-1200.webp` for the product page and `<index>-400.webp` for cards.
 * products.images holds the 1200px URLs; this returns the card-sized one.
 * Any other URL (admin uploads, static files) is returned unchanged.
 */
export function productThumbUrl(url: string | undefined): string | undefined {
  return url?.replace(/-1200\.webp$/, "-400.webp");
}
