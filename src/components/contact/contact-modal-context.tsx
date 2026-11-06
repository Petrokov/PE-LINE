"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface ContactModalContextValue {
  isOpen: boolean;
  /** Message the form starts with, e.g. the product an inquiry is about. */
  prefillMessage: string;
  /** Products the inquiry is about, so the customer can be mailed an offer. */
  items: { slug: string; qty: number }[];
  /** Accepts anything so it can be used directly as onClick; only a string is used as prefill. */
  open: (prefillMessage?: unknown, items?: { slug: string; qty: number }[]) => void;
  close: () => void;
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefillMessage, setPrefillMessage] = useState("");
  const [items, setItems] = useState<{ slug: string; qty: number }[]>([]);

  return (
    <ContactModalContext.Provider
      value={{
        isOpen,
        prefillMessage,
        items,
        open: (message, listed) => {
          setPrefillMessage(typeof message === "string" ? message : "");
          setItems(Array.isArray(listed) ? listed : []);
          setIsOpen(true);
        },
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error("useContactModal must be used within ContactModalProvider");
  }
  return ctx;
}
