"use server";

import { z } from "zod";
import { sendMail } from "@/lib/mailer";
import {
  escapeHtml,
  loadOfferLines,
  parseOfferItems,
  productListText,
  sendOffer,
  staffProductTableHtml,
} from "@/lib/offer";

const schema = z.object({
  name: z.string().min(2, "Unesite ime").max(120),
  email: z.string().email("Neispravna e-mail adresa").max(254),
  phone: z.string().max(40).optional(),
  company: z.string().max(160).optional(),
  message: z.string().min(10, "Poruka je prekratka").max(10000),
  gdpr: z.string(),
});

export type InquiryResult = { ok: boolean; message: string };

const NOTIFY_TO = () => process.env.CONTACT_EMAIL || "projekti@petrokov.hr";

// Every inquiry with products mails an offer to whatever address was typed in,
// so one mailbox may only be mailed a few times an hour (per server instance).
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const recentByEmail = new Map<string, number[]>();

function rateLimited(email: string) {
  const now = Date.now();
  const recent = (recentByEmail.get(email) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    recentByEmail.set(email, recent);
    return true;
  }
  recent.push(now);
  recentByEmail.set(email, recent);
  if (recentByEmail.size > 5000) {
    for (const [key, times] of recentByEmail) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) recentByEmail.delete(key);
    }
  }
  return false;
}

export async function submitInquiry(
  _prev: InquiryResult | null,
  formData: FormData
): Promise<InquiryResult> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("website")) {
    return { ok: true, message: "Upit je uspješno poslan! Javit ćemo se u roku 24 sata." };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    company: formData.get("company") || undefined,
    message: formData.get("message"),
    gdpr: formData.get("gdpr"),
  };

  const parse = schema.safeParse(raw);

  if (!parse.success) {
    return { ok: false, message: "Provjerite unesene podatke." };
  }

  if (!raw.gdpr) {
    return { ok: false, message: "Morate prihvatiti obradu osobnih podataka." };
  }

  const { name, phone, company, message } = parse.data;
  const email = parse.data.email.trim().toLowerCase();

  if (rateLimited(email)) {
    return { ok: false, message: "Previše upita s ove adrese. Pokušajte ponovo kasnije." };
  }

  // Products come as slug + quantity; names, images and prices are looked up here.
  const items = parseOfferItems(formData.get("items"));
  const lines = items ? await loadOfferLines(items) : [];

  // The customer gets an indicative offer with retail prices. A failure here must
  // not lose the inquiry, so the internal mail goes out either way.
  const offerText = lines.length ? await sendOffer({ name, email }, lines) : null;

  const text = [
    `Ime: ${name}`,
    `Email: ${email}`,
    `Telefon: ${phone || "-"}`,
    `Tvrtka: ${company || "-"}`,
    ``,
    `Poruka:`,
    message,
    ...(lines.length
      ? [
          ``,
          productListText(lines),
          ``,
          offerText ? "== Okvirna ponuda poslana kupcu ==" : "!! Okvirna ponuda kupcu NIJE poslana !!",
          ...(offerText ? [offerText] : []),
        ]
      : []),
  ].join("\n");

  const html = `
    <p>Novi upit s weba.${lines.length ? (offerText ? " Kupcu je poslana okvirna ponuda." : " <strong>Okvirna ponuda kupcu nije poslana.</strong>") : ""}</p>
    <p><strong>Ime:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Telefon:</strong> ${escapeHtml(phone || "-")}</p>
    <p><strong>Tvrtka:</strong> ${escapeHtml(company || "-")}</p>
    <hr/>
    <p><strong>Poruka:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    ${lines.length ? `<hr/>${staffProductTableHtml(lines)}` : ""}
  `;

  const notified = await sendMail({
    to: NOTIFY_TO(),
    replyTo: email,
    subject: lines.length ? `Novi upit s popisom proizvoda — ${name}` : `Novi upit — ${name}`,
    text,
    html,
  });

  if (!notified) {
    return { ok: false, message: "Greška pri slanju. Molimo pokušajte ponovo." };
  }

  return { ok: true, message: "Upit je uspješno poslan! Javit ćemo se u roku 24 sata." };
}
