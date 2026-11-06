import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing mail through the same SMTP account as the Petrokov website.
 * Not configured = mail is skipped and the caller reports it; nothing throws.
 */

let transporter: Transporter | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    transporter = null;
    return transporter;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; 587 starts plain and upgrades with STARTTLS.
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
  });
  return transporter;
}

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  /** Optional HTML version; `text` stays as the plain-text alternative. */
  html?: string;
  replyTo?: string;
};

/** Returns false when SMTP is not configured or the server refused the message. */
export async function sendMail(message: MailMessage): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[mailer] SMTP not configured, mail skipped:", message.subject);
    return false;
  }

  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: message.to,
      // Visitor input ends up in the subject; a newline there would be header injection.
      subject: message.subject.replace(/[\r\n]+/g, " "),
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });
    return true;
  } catch (error) {
    console.error("[mailer] send failed:", error);
    return false;
  }
}
