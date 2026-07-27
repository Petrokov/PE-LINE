"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

const schema = z.object({
  name: z.string().min(2, "Unesite ime"),
  email: z.string().email("Neispravna e-mail adresa"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, "Poruka je prekratka"),
  gdpr: z.string(),
});

export type InquiryResult = { ok: boolean; message: string };

export async function submitInquiry(
  _prev: InquiryResult | null,
  formData: FormData
): Promise<InquiryResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
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

  const { name, email, phone, company, message } = parse.data;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.brevo.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PE-LINE Web" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL ?? "info@pe-line.hr",
      replyTo: email,
      subject: `Novi upit — ${name}`,
      text: [
        `Ime: ${name}`,
        `Email: ${email}`,
        `Telefon: ${phone || "-"}`,
        `Tvrtka: ${company || "-"}`,
        ``,
        `Poruka:`,
        message,
      ].join("\n"),
      html: `
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Telefon:</strong> ${phone || "-"}</p>
        <p><strong>Tvrtka:</strong> ${company || "-"}</p>
        <hr/>
        <p><strong>Poruka:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return { ok: true, message: "Upit je uspješno poslan! Javit ćemo se u roku 24 sata." };
  } catch (err) {
    console.error("Email send error:", err);
    return { ok: false, message: "Greška pri slanju. Molimo pokušajte ponovo." };
  }
}
