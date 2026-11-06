/**
 * SAP Business One → Supabase price sync.
 *
 * Reads the retail price (SAP price list 1, "Cijena VP", net) and the VAT rate
 * of every catalog article and stores them in product_prices, where the
 * website reads them to build the indicative offer mailed after an inquiry.
 * The catalog itself shows no prices.
 *
 * Run from a machine inside the Petrokov network (the SAP Service Layer is
 * LAN-only):
 *
 *   npm run sap:prices            full run
 *   npm run sap:prices -- --dry   fetch and map, write nothing
 *
 * Needs the SAP_* keys and SUPABASE_SERVICE_ROLE_KEY in .env.local and
 * supabase/migration 0009_product_prices.sql applied. Articles must already exist in
 * products (run sap:import first).
 *
 * An article without a positive price in list 1 gets no row, and a row from an
 * earlier run is removed: the offer then says "cijena na upit" for it.
 */

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------- env

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!m) continue;
      const value = m[2].trim().replace(/^["'](.*)["']$/, "$1");
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  } catch {
    // fall back to the real environment
  }
}

loadEnvLocal();

const DRY_RUN = process.argv.includes("--dry");

const PRICE_LIST = 1;
const SAP_BATCH = 40; // item codes per SAP request, keeps the URL short
const DB_BATCH = 500;

const sapUrl = (process.env.SAP_SERVICE_LAYER_URL ?? "").replace(/\/+$/, "");
const sapCompanyDB = process.env.SAP_COMPANY_DB ?? "";
const sapUser = process.env.SAP_USERNAME ?? "";
const sapPassword = process.env.SAP_PASSWORD ?? "";
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const missing = [
  ["SAP_SERVICE_LAYER_URL", sapUrl],
  ["SAP_COMPANY_DB", sapCompanyDB],
  ["SAP_USERNAME", sapUser],
  ["SAP_PASSWORD", sapPassword],
  ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
  ["SUPABASE_SERVICE_ROLE_KEY", serviceKey],
]
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Missing env: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.SAP_INSECURE_TLS === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn(
    "WARNING: certificate verification disabled (SAP_INSECURE_TLS=1). " +
      "Remove it once the SAP certificate is trusted on this machine."
  );
}

// ---------------------------------------------------------------- types

type SapItem = {
  ItemCode: string;
  SalesVATGroup: string | null;
  ItemPrices?: Array<{ PriceList: number; Price: number; Currency: string | null }>;
};

type VatLine = { Effectivefrom: string | null; Rate: number };

type PriceRow = {
  sap_item_code: string;
  price_net: number;
  vat_rate: number;
  currency: string;
  price_list_no: number;
  synced_at: string;
};

// ---------------------------------------------------------------- helpers

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const report: string[] = [];
function log(line = "") {
  report.push(line);
  console.log(line);
}

// ---------------------------------------------------------------- SAP

async function sapLogin() {
  const res = await fetch(`${sapUrl}/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CompanyDB: sapCompanyDB, UserName: sapUser, Password: sapPassword }),
  });
  if (!res.ok) {
    throw new Error(`SAP login failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
  const cookie = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  if (cookie) return cookie;
  const body = (await res.json()) as { SessionId?: string };
  return `B1SESSION=${body.SessionId}`;
}

async function sapLogout(cookie: string) {
  await fetch(`${sapUrl}/Logout`, { method: "POST", headers: { Cookie: cookie } }).catch(() => {});
}

async function sapGet<T>(cookie: string, path: string): Promise<T> {
  const res = await fetch(`${sapUrl}/${path}`, {
    headers: { Cookie: cookie, Prefer: "odata.maxpagesize=500" },
  });
  if (!res.ok) {
    throw new Error(`SAP ${path.slice(0, 80)}: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Items for one batch of codes, following the server's paging if it kicks in. */
async function sapItems(cookie: string, codes: string[]) {
  const filter = codes.map((c) => `ItemCode eq '${c.replace(/'/g, "''")}'`).join(" or ");
  let next: string | null = `Items?$select=ItemCode,SalesVATGroup,ItemPrices&$filter=${encodeURIComponent(filter)}`;
  const out: SapItem[] = [];
  while (next) {
    const body: { value: SapItem[]; "odata.nextLink"?: string; "@odata.nextLink"?: string } =
      await sapGet(cookie, next);
    out.push(...body.value);
    next = body["odata.nextLink"] ?? body["@odata.nextLink"] ?? null;
  }
  return out;
}

/** The rate in force today for a VAT group. */
async function sapVatRate(cookie: string, group: string) {
  const body = await sapGet<{ VatGroups_Lines?: VatLine[] }>(
    cookie,
    `VatGroups('${encodeURIComponent(group)}')`
  );
  const today = new Date().toISOString();
  const current = (body.VatGroups_Lines ?? [])
    .filter((l) => !l.Effectivefrom || l.Effectivefrom <= today)
    .sort((a, b) => (a.Effectivefrom ?? "").localeCompare(b.Effectivefrom ?? ""))
    .pop();
  return current ? Number(current.Rate) : null;
}

// ---------------------------------------------------------------- Supabase

async function sb(path: string, init: RequestInit = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 400);
    throw new Error(`Supabase ${init.method ?? "GET"} ${path}: ${res.status} ${detail}`);
  }
  return res;
}

async function sbSelectAll<T>(table: string, select: string): Promise<T[]> {
  const out: T[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const res = await sb(`${table}?select=${select}&limit=${pageSize}&offset=${offset}`);
    const rows = (await res.json()) as T[];
    out.push(...rows);
    if (rows.length < pageSize) return out;
  }
}

// ---------------------------------------------------------------- main

async function main() {
  const startedAt = new Date();
  log(`SAP price sync ${DRY_RUN ? "(dry run) " : ""}started ${startedAt.toISOString()}`);

  const products = await sbSelectAll<{ sap_item_code: string | null }>("products", "sap_item_code");
  // The dummy seed product has no SAP code; it has no price to sync.
  const codes = products.map((p) => p.sap_item_code).filter((c): c is string => !!c);
  log(`Catalog articles: ${codes.length}`);

  const cookie = await sapLogin();
  const items: SapItem[] = [];
  const vatByGroup = new Map<string, number | null>();
  try {
    for (const batch of chunk(codes, SAP_BATCH)) {
      items.push(...(await sapItems(cookie, batch)));
      process.stderr.write(`\rSAP: ${items.length}/${codes.length}`);
    }
    process.stderr.write("\n");

    for (const group of new Set(items.map((i) => i.SalesVATGroup).filter((g): g is string => !!g))) {
      vatByGroup.set(group, await sapVatRate(cookie, group));
    }
  } finally {
    await sapLogout(cookie);
  }

  const syncedAt = new Date().toISOString();
  const rows: PriceRow[] = [];
  const noPrice: string[] = [];
  const noVat: string[] = [];
  const notInSap = new Set(codes);

  for (const item of items) {
    notInSap.delete(item.ItemCode);
    const entry = item.ItemPrices?.find((p) => p.PriceList === PRICE_LIST);
    const net = Number(entry?.Price ?? 0);
    if (!(net > 0)) {
      noPrice.push(item.ItemCode);
      continue;
    }
    const vat = item.SalesVATGroup ? vatByGroup.get(item.SalesVATGroup) : null;
    if (vat === null || vat === undefined) {
      noVat.push(item.ItemCode);
      continue;
    }
    rows.push({
      sap_item_code: item.ItemCode,
      price_net: Math.round(net * 100) / 100,
      vat_rate: vat,
      currency: entry?.Currency || "EUR",
      price_list_no: PRICE_LIST,
      synced_at: syncedAt,
    });
  }

  log("");
  log(`Priced: ${rows.length}`);
  log(`No price in list ${PRICE_LIST} (offer says "cijena na upit"): ${noPrice.length}`);
  log(`No usable VAT rate, skipped: ${noVat.length}`);
  log(`Not found in SAP: ${notInSap.size}`);
  log(
    `VAT rates in use: ${[...vatByGroup].map(([g, r]) => `${g}=${r ?? "?"}%`).join(", ") || "-"}`
  );
  const currencies = new Set(rows.map((r) => r.currency));
  if (currencies.size > 1) log(`WARNING: more than one currency: ${[...currencies].join(", ")}`);
  if (noVat.length) log(`  Without VAT (first 10): ${noVat.slice(0, 10).join(", ")}`);

  if (DRY_RUN) {
    log("");
    log("DRY RUN: nothing written. Sample:");
    for (const r of rows.slice(0, 5)) {
      const gross = Math.round(r.price_net * (1 + r.vat_rate / 100) * 100) / 100;
      log(`  ${r.sap_item_code}  net ${r.price_net}  PDV ${r.vat_rate}%  s PDV-om ${gross} ${r.currency}`);
    }
  } else {
    let written = 0;
    for (const batch of chunk(rows, DB_BATCH)) {
      await sb("product_prices?on_conflict=sap_item_code", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(batch),
      });
      written += batch.length;
      process.stderr.write(`\rupsert: ${written}/${rows.length}`);
    }
    process.stderr.write("\n");
    log(`Upserted: ${written}`);

    // A price that disappeared in SAP must not live on in the database.
    const keep = new Set(rows.map((r) => r.sap_item_code));
    const existing = await sbSelectAll<{ sap_item_code: string }>("product_prices", "sap_item_code");
    const stale = existing.map((r) => r.sap_item_code).filter((c) => !keep.has(c));
    for (const batch of chunk(stale, DB_BATCH)) {
      const list = batch.map((code) => `"${code}"`).join(",");
      await sb(`product_prices?sap_item_code=in.(${list})`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });
    }
    log(`Removed (no longer priced): ${stale.length}`);
  }

  const finishedAt = new Date();
  log("");
  log(`Finished in ${Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)}s`);

  const outDir = join(process.cwd(), "scripts", ".out");
  mkdirSync(outDir, { recursive: true });
  const stamp = finishedAt.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const reportPath = join(outDir, `sap-prices-${stamp}${DRY_RUN ? "-dry" : ""}.txt`);
  writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
