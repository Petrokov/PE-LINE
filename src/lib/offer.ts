import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import { productThumbUrl } from "@/lib/product-images";

/**
 * Indicative offer mailed to the customer after an inquiry. The browser only
 * sends slug + quantity; names, images and prices are read here from the
 * database, so a tampered request cannot set its own price.
 */

const itemsSchema = z
  .array(
    z.object({
      slug: z.string().min(1).max(200),
      qty: z.number().int().min(1).max(9999),
    })
  )
  .min(1)
  .max(50);

export type OfferItem = z.infer<typeof itemsSchema>[number];

/** The hidden `items` form field: JSON [{slug, qty}]. Null when absent or malformed. */
export function parseOfferItems(raw: FormDataEntryValue | null): OfferItem[] | null {
  if (typeof raw !== "string" || !raw || raw.length > 8000) return null;
  try {
    const parsed = itemsSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    // The same slug twice is one line with the quantities added up.
    const merged = new Map<string, number>();
    for (const item of parsed.data) merged.set(item.slug, (merged.get(item.slug) ?? 0) + item.qty);
    return [...merged].map(([slug, qty]) => ({ slug, qty }));
  } catch {
    return null;
  }
}

export type OfferLine = {
  name: string;
  code: string;
  qty: number;
  unitGross: number | null;
  imageUrl: string | null;
};

const eur = new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" });

/** Service-role client: product_prices has no public policy on purpose. */
function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Active catalog articles behind the submitted slugs, with their current prices. */
export async function loadOfferLines(items: OfferItem[]): Promise<OfferLine[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];

  const { data: products } = await supabase
    .from("products")
    .select("slug, sap_item_code, name_hr, images")
    .in("slug", items.map((i) => i.slug))
    .eq("active", true)
    .not("sap_item_code", "is", null);
  if (!products?.length) return [];

  const { data: prices } = await supabase
    .from("product_prices")
    .select("sap_item_code, price_gross")
    .in("sap_item_code", products.map((p) => p.sap_item_code));
  const priceByCode = new Map((prices ?? []).map((p) => [p.sap_item_code, Number(p.price_gross)]));
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  const lines: OfferLine[] = [];
  for (const item of items) {
    const product = productBySlug.get(item.slug);
    if (!product) continue;
    lines.push({
      name: product.name_hr ?? item.slug,
      code: product.sap_item_code,
      qty: item.qty,
      unitGross: priceByCode.get(product.sap_item_code) ?? null,
      imageUrl: productThumbUrl((product.images as string[] | null)?.[0]) ?? null,
    });
  }
  return lines;
}

const DEFAULT_CONTACT = "projekti@petrokov.hr";
const SIGNATURE = "PE-LINE (Petrokov d.o.o.)";

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function offerBody(customerName: string, lines: OfferLine[], contactEmail: string) {
  const allPriced = lines.every((l) => l.unitGross !== null);
  const total = lines.reduce((sum, l) => sum + (l.unitGross ?? 0) * l.qty, 0);

  const rows = lines.map((l) => {
    const head = `- ${l.name} (šifra ${l.code})`;
    if (l.unitGross === null) return `${head}\n  ${l.qty} kom — cijena na upit`;
    return `${head}\n  ${l.qty} kom × ${eur.format(l.unitGross)} = ${eur.format(l.unitGross * l.qty)}`;
  });

  return [
    `Poštovani ${customerName},`,
    "",
    "hvala na upitu. U nastavku je okvirna ponuda za proizvode s Vašeg popisa.",
    "",
    ...rows,
    "",
    allPriced
      ? `Ukupno (PDV uključen): ${eur.format(total)}`
      : `Ukupno za proizvode s cijenom (PDV uključen): ${eur.format(total)}\nZa proizvode označene s "cijena na upit" javit ćemo se s cijenom.`,
    "",
    "NAPOMENA: ovo je okvirna ponuda. Cijene su maloprodajne, s uključenim PDV-om, i podložne su promjenama. Konačnu cijenu i raspoloživost potvrđujemo u posebnoj ponudi.",
    "",
    `Za konačnu ponudu ili pitanja dovoljno je samo odgovoriti na ovu poruku (Reply). Vaš odgovor automatski stiže na ${contactEmail}.`,
    "",
    SIGNATURE,
  ].join("\n");
}

/**
 * HTML twin of offerBody: image | product | price. Tables and inline styles
 * only, because that is what mail clients render reliably.
 */
function offerHtml(customerName: string, lines: OfferLine[], contactEmail: string) {
  const allPriced = lines.every((l) => l.unitGross !== null);
  const total = lines.reduce((sum, l) => sum + (l.unitGross ?? 0) * l.qty, 0);
  const cell = "padding:10px 8px;border-bottom:1px solid #e5e7eb;vertical-align:middle;";

  const rows = lines
    .map((l) => {
      const img = l.imageUrl
        ? `<img src="${escapeHtml(l.imageUrl)}" alt="${escapeHtml(l.name)}" width="64" height="64" style="display:block;width:64px;height:64px;object-fit:contain;border:0;">`
        : "";
      const price =
        l.unitGross === null
          ? `<span style="color:#6b7280;">cijena na upit</span><br><span style="font-size:12px;color:#6b7280;">${l.qty} kom</span>`
          : `<strong>${eur.format(l.unitGross * l.qty)}</strong><br><span style="font-size:12px;color:#6b7280;">${l.qty} × ${eur.format(l.unitGross)}</span>`;
      return `<tr>
<td style="${cell}width:72px;">${img}</td>
<td style="${cell}">${escapeHtml(l.name)}<br><span style="font-size:12px;color:#6b7280;">šifra ${escapeHtml(l.code)}</span></td>
<td style="${cell}text-align:right;white-space:nowrap;">${price}</td>
</tr>`;
    })
    .join("\n");

  const totalLine = allPriced
    ? `Ukupno (PDV uključen): <strong>${eur.format(total)}</strong>`
    : `Ukupno za proizvode s cijenom (PDV uključen): <strong>${eur.format(total)}</strong><br>Za proizvode označene s "cijena na upit" javit ćemo se s cijenom.`;

  return `<!doctype html>
<html lang="hr"><body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#111827;">
<p>Poštovani ${escapeHtml(customerName)},</p>
<p>hvala na upitu. U nastavku je okvirna ponuda za proizvode s Vašeg popisa.</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:collapse;">
<thead><tr>
<th style="padding:8px;text-align:left;border-bottom:2px solid #111827;font-size:12px;">Slika</th>
<th style="padding:8px;text-align:left;border-bottom:2px solid #111827;font-size:12px;">Proizvod</th>
<th style="padding:8px;text-align:right;border-bottom:2px solid #111827;font-size:12px;">Cijena</th>
</tr></thead>
<tbody>
${rows}
</tbody>
</table>
<p style="margin-top:16px;">${totalLine}</p>
<p style="font-size:13px;color:#4b5563;"><strong>NAPOMENA:</strong> ovo je okvirna ponuda. Cijene su maloprodajne, s uključenim PDV-om, i podložne su promjenama. Konačnu cijenu i raspoloživost potvrđujemo u posebnoj ponudi.</p>
<p>Za konačnu ponudu ili pitanja dovoljno je samo odgovoriti na ovu poruku (<strong>Reply</strong>). Vaš odgovor automatski stiže na <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>.</p>
<p>${escapeHtml(SIGNATURE)}</p>
</body></html>`;
}

/** Staff copy's product table: code | product | qty | unit price | amount, total underneath. */
export function staffProductTableHtml(lines: OfferLine[]) {
  const head = "padding:8px;border-bottom:2px solid #111827;font-size:12px;";
  const cell = "padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top;";
  const total = lines.reduce((sum, l) => sum + (l.unitGross ?? 0) * l.qty, 0);
  const unpriced = lines.some((l) => l.unitGross === null);

  const rows = lines
    .map(
      (l) => `<tr>
<td style="${cell}white-space:nowrap;">${escapeHtml(l.code)}</td>
<td style="${cell}">${escapeHtml(l.name)}</td>
<td style="${cell}text-align:right;white-space:nowrap;">${l.qty}</td>
<td style="${cell}text-align:right;white-space:nowrap;">${l.unitGross === null ? "na upit" : eur.format(l.unitGross)}</td>
<td style="${cell}text-align:right;white-space:nowrap;">${l.unitGross === null ? "—" : `<strong>${eur.format(l.unitGross * l.qty)}</strong>`}</td>
</tr>`
    )
    .join("\n");

  return `<table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:720px;border-collapse:collapse;">
<thead><tr>
<th style="${head}text-align:left;">Šifra</th>
<th style="${head}text-align:left;">Proizvod</th>
<th style="${head}text-align:right;">Kol.</th>
<th style="${head}text-align:right;">Cijena/kom</th>
<th style="${head}text-align:right;">Iznos</th>
</tr></thead>
<tbody>
${rows}
</tbody>
<tfoot><tr>
<td colspan="4" style="padding:10px 8px;text-align:right;">Ukupno (PDV uključen)${unpriced ? ", bez artikala na upit" : ""}:</td>
<td style="padding:10px 8px;text-align:right;white-space:nowrap;"><strong>${eur.format(total)}</strong></td>
</tr></tfoot>
</table>`;
}

/** The product list as plain text, for the internal mail. */
export function productListText(lines: OfferLine[]) {
  return [
    "Upit za sljedeće proizvode:",
    ...lines.map((l) => `- ${l.name} (šifra ${l.code}) — ${l.qty} kom`),
  ].join("\n");
}

/** Mails the customer an indicative offer; returns the offer text, or null when it could not be sent. */
export async function sendOffer(customer: { name: string; email: string }, lines: OfferLine[]) {
  const contactEmail = process.env.CONTACT_EMAIL || DEFAULT_CONTACT;
  const text = offerBody(customer.name, lines, contactEmail);
  const sent = await sendMail({
    to: customer.email,
    subject: "Okvirna ponuda — PE-LINE",
    text,
    html: offerHtml(customer.name, lines, contactEmail),
    replyTo: contactEmail,
  });
  return sent ? text : null;
}
