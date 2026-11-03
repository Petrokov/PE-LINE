"use client";

import { useCallback, useSyncExternalStore } from "react";

export type InquiryListItem = {
  slug: string;
  /** Product URLs are nested under their category, so the list keeps it for linking back. */
  categorySlug: string;
  title: string;
  imageUrl: string;
  /** How many pieces of this product the visitor wants a quote for. */
  qty: number;
};

const STORAGE_KEY = "pe-line:inquiry-list";
const CHANGE_EVENT = "pe-line:inquiry-list-changed";

export const MIN_QTY = 1;
export const MAX_QTY = 99;

export function clampQty(value: number) {
  if (!Number.isFinite(value)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.round(value)));
}

function normalize(entry: unknown): InquiryListItem | null {
  if (!entry || typeof entry !== "object") return null;
  const item = entry as Partial<InquiryListItem>;
  if (typeof item.slug !== "string" || typeof item.title !== "string") return null;
  return {
    slug: item.slug,
    categorySlug: typeof item.categorySlug === "string" ? item.categorySlug : "",
    title: item.title,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "",
    qty: clampQty(typeof item.qty === "number" ? item.qty : 1),
  };
}

function readList(): InquiryListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((item): item is InquiryListItem => item !== null);
  } catch {
    return [];
  }
}

function writeList(items: InquiryListItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage blocked (private mode, policy): the list simply does not persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addToInquiryList(item: Omit<InquiryListItem, "qty">, qty = 1) {
  const current = readList();
  const wanted = clampQty(qty);
  const existing = current.find((entry) => entry.slug === item.slug);
  if (existing) {
    // Adding an already listed product tops up its quantity instead of doing nothing.
    writeList(
      current.map((entry) =>
        entry.slug === item.slug ? { ...entry, qty: clampQty(entry.qty + wanted) } : entry
      )
    );
    return;
  }
  writeList([...current, { ...item, qty: wanted }]);
}

export function setInquiryQuantity(slug: string, qty: number) {
  writeList(
    readList().map((item) => (item.slug === slug ? { ...item, qty: clampQty(qty) } : item))
  );
}

function removeFromInquiryList(slug: string) {
  writeList(readList().filter((item) => item.slug !== slug));
}

function clearInquiryList() {
  writeList([]);
}

// useSyncExternalStore needs the same array back while storage is unchanged,
// so the parsed list is cached against the raw string it came from.
const EMPTY: InquiryListItem[] = [];
let snapshot: { raw: string | null; items: InquiryListItem[] } = { raw: null, items: EMPTY };

function getSnapshot(): InquiryListItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: behave as an empty list.
  }
  if (raw !== snapshot.raw) snapshot = { raw, items: raw ? readList() : EMPTY };
  return snapshot.items;
}

// The server render (and hydration) always starts from an empty list.
const getServerSnapshot = () => EMPTY;

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  // Another tab changed the list.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useInquiryList() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const remove = useCallback((slug: string) => removeFromInquiryList(slug), []);
  const clear = useCallback(() => clearInquiryList(), []);
  const setQuantity = useCallback(
    (slug: string, qty: number) => setInquiryQuantity(slug, qty),
    []
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.qty, 0);

  return { items, totalQuantity, remove, clear, setQuantity };
}

/** Quantity of `slug` on the list, or 0 when it is not on it. */
export function useInquiryListQuantity(slug: string) {
  const { items } = useInquiryList();
  return items.find((item) => item.slug === slug)?.qty ?? 0;
}
