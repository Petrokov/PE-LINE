"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { submitInquiry, type InquiryResult } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const initialState: InquiryResult | null = null;

const fieldClass =
  "w-full bg-transparent border-0 border-b border-line text-ink text-sm pb-2 placeholder:text-muted/50 focus:outline-none focus:border-petrol transition-colors";

interface ContactFormProps {
  prefillMessage?: string;
  /** Products the inquiry is about; the server mails the customer an offer for them. */
  items?: { slug: string; qty: number }[];
  onSuccess?: () => void;
}

export function ContactForm({ prefillMessage = "", items, onSuccess }: ContactFormProps) {
  const t = useTranslations("contact");
  const [state, action, isPending] = useActionState(submitInquiry, initialState);

  useEffect(() => {
    if (state?.ok) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-7">
      {items && items.length > 0 && <input type="hidden" name="items" value={JSON.stringify(items)} />}
      {/* Honeypot: hidden from people, bots fill it in. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
        <div>
          <label className="block text-xs font-medium text-muted mb-2">{t("name")} *</label>
          <input name="name" required className={fieldClass} placeholder="Ivan Horvat" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-2">{t("email")} *</label>
          <input
            name="email"
            type="email"
            required
            className={fieldClass}
            placeholder="ivan@tvrtka.hr"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-2">{t("company")}</label>
          <input name="company" className={fieldClass} placeholder="Tvrtka d.o.o." />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-2">{t("phone")}</label>
          <input name="phone" type="tel" className={fieldClass} placeholder="+385 1 234 5678" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-2">{t("message")} *</label>
        <textarea
          name="message"
          required
          rows={prefillMessage ? 6 : 3}
          defaultValue={prefillMessage}
          className={`${fieldClass} resize-none`}
          placeholder={t("messagePlaceholder")}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          name="gdpr"
          type="checkbox"
          id="gdpr"
          required
          className="mt-0.5 w-4 h-4 accent-petrol shrink-0"
        />
        <label htmlFor="gdpr" className="text-xs text-muted leading-relaxed cursor-pointer">
          {t("gdpr")}
        </label>
      </div>

      {state && (
        <div
          className={`px-4 py-3 text-sm rounded-[8px] ${
            state.ok
              ? "bg-cyan/10 text-petrol border border-cyan/30"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {state.message}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto justify-center gap-2"
      >
        <Send size={14} strokeWidth={1.5} />
        {isPending ? t("sending") : t("send")}
      </Button>
    </form>
  );
}
