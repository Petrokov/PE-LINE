/**
 * SAP Business One → PE-LINE catalog import.
 *
 * Uses the same Service Layer view as the Petrokov catalog
 * (WebExportArtikalaQuery, same company database) and keeps only the PE-LINE
 * articles the client confirmed in data/sap-selection.csv.
 *
 * Run from a machine inside the Petrokov network (the Service Layer is LAN-only):
 *
 *   npm run sap:import                     full run
 *   npm run sap:import -- --dry            fetch and compare, write nothing
 *   npm run sap:import -- --from dump.json read a saved view dump instead of SAP
 *
 * Needs SAP_* keys and SUPABASE_SERVICE_ROLE_KEY in .env.local (a dry run can
 * do with the anon key). Requires supabase/migrations/0006_sap_sync.sql.
 *
 * Per article it writes name, SAP description, unit, category and active flag.
 * It never changes a slug, never touches images, specs or hand-written
 * descriptions, and never deletes: an article SAP marks inactive, or one taken
 * off the selection list, is hidden with active = false.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

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
const fromIndex = process.argv.indexOf("--from");
const FROM_FILE = fromIndex > -1 ? process.argv[fromIndex + 1] : null;

const sapUrl = (process.env.SAP_SERVICE_LAYER_URL ?? "").replace(/\/+$/, "");
const sapCompanyDB = process.env.SAP_COMPANY_DB ?? "";
const sapUser = process.env.SAP_USERNAME ?? "";
const sapPassword = process.env.SAP_PASSWORD ?? "";
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
// A dry run only reads, which the public policies allow.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? (DRY_RUN ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" : "");

const PAGE_SIZE = Number(process.env.SAP_PAGE_SIZE ?? 500);
const BATCH_SIZE = 200;
const BRAND = "PE-LINE";
const VIEW = "WebExportArtikalaQuery";

const required: Array<[string, string]> = [
  ...(FROM_FILE
    ? []
    : ([
        ["SAP_SERVICE_LAYER_URL", sapUrl],
        ["SAP_COMPANY_DB", sapCompanyDB],
        ["SAP_USERNAME", sapUser],
        ["SAP_PASSWORD", sapPassword],
      ] as Array<[string, string]>)),
  ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
  [DRY_RUN ? "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY" : "SUPABASE_SERVICE_ROLE_KEY", supabaseKey],
];
const missing = required.filter(([, v]) => !v).map(([k]) => k);
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

type SapArticle = {
  SifraRobe: string;
  NazivRobe: string;
  Brend: string | null;
  NazivJM: string | null;
  Aktivan: string | null;
  B2BOpisProizvoda: string | null;
  DatumAzuriranja: string | null;
};

type SelectionEntry = { code: string; catalogueNumber: string; name: string; categorySlug: string };

type DbProduct = {
  id: string;
  slug: string;
  sap_item_code: string | null;
  name_hr: string;
  sap_name: string | null;
  category_id: string;
  sap_description: string | null;
  description_sl: string | null;
  description_en: string | null;
  unit: string | null;
  active: boolean;
};

type SyncRow = {
  sap_item_code: string;
  slug: string;
  /** Web name: kept as it is on existing products, the SAP name on new ones. */
  name_hr: string;
  sap_name: string;
  sap_description: string | null;
  unit: string | null;
  category_id: string;
  active: boolean;
  sap_updated_at: string | null;
  last_synced_at: string;
};

// ---------------------------------------------------------------- helpers

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** SAP names carry double spaces ("BOJLER EL.KOMBI  80 l"); the site shows them collapsed. */
function cleanName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

/** SAP units arrive in mixed case and with stray dots ("KOM", "kpl."). */
function normalizeUnit(unit: string | null) {
  if (!unit) return null;
  return unit.trim().replace(/\.+$/, "").toLowerCase() || null;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** One `;`-separated CSV line; quoted fields may hold `;` and doubled `""` (names like `1"`). */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ";") {
      fields.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field);
  return fields;
}

function loadSelection(): SelectionEntry[] {
  const raw = readFileSync(join(process.cwd(), "data", "sap-selection.csv"), "utf8").replace(/^﻿/, "");
  return raw
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const [code, catalogueNumber, name, categorySlug] = parseCsvLine(line);
      return {
        code: code.trim(),
        catalogueNumber: (catalogueNumber ?? "").trim(),
        name: (name ?? "").trim(),
        categorySlug: (categorySlug ?? "").trim(),
      };
    });
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

async function sapFetch(cookie: string, first: string) {
  const all: SapArticle[] = [];
  // $top in the URL is ignored by the Service Layer; the Prefer header is what
  // sets the page size (without it we get 20 rows per request).
  let next: string | null = first;
  while (next) {
    const res = await fetch(`${sapUrl}/sml.svc/${next}`, {
      headers: { Cookie: cookie, Prefer: `odata.maxpagesize=${PAGE_SIZE}` },
    });
    if (!res.ok) {
      throw new Error(`SAP query failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    }
    const body = (await res.json()) as { value: SapArticle[]; "@odata.nextLink"?: string };
    all.push(...body.value);
    next = body["@odata.nextLink"] ?? null;
    process.stderr.write(`\rSAP: ${all.length} rows`);
  }
  process.stderr.write("\n");
  return all;
}

/**
 * Asks SAP for PE-LINE rows only; if the view rejects the filter, pulls the
 * whole view (~44.000 rows, like the Petrokov import) and filters here.
 */
async function sapFetchBrand(cookie: string, log: (line: string) => void) {
  const filter = encodeURIComponent(`Brend eq '${BRAND}'`);
  try {
    const rows = await sapFetch(cookie, `${VIEW}?$filter=${filter}`);
    log(`SAP filter on Brend accepted`);
    return rows;
  } catch (err) {
    log(`SAP filter on Brend rejected (${err instanceof Error ? err.message.slice(0, 120) : err}), fetching the whole view`);
    return sapFetch(cookie, VIEW);
  }
}

async function sapLogout(cookie: string) {
  await fetch(`${sapUrl}/Logout`, { method: "POST", headers: { Cookie: cookie } }).catch(() => {});
}

// ---------------------------------------------------------------- Supabase

async function sb(path: string, init: RequestInit = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
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

async function sbSelect<T>(path: string): Promise<T[]> {
  return (await (await sb(path)).json()) as T[];
}

// ---------------------------------------------------------------- main

async function main() {
  const startedAt = new Date();
  const report: string[] = [];
  const log = (line: string) => {
    console.log(line);
    report.push(line);
  };

  log(`PE-LINE SAP import started ${startedAt.toISOString()}${DRY_RUN ? " (DRY RUN)" : ""}`);

  const selection = loadSelection();
  log(`Selection: ${selection.length} articles (data/sap-selection.csv)`);

  const [categories, rawProducts] = await Promise.all([
    sbSelect<{ id: string; slug: string }>("categories?select=id,slug"),
    // select=* so a dry run also works before migration 0006 adds the SAP columns.
    sbSelect<Partial<DbProduct> & { specs?: Array<{ key: string; value: string }> }>("products?select=*&limit=10000"),
  ]);
  const migrated = rawProducts.length === 0 || "sap_item_code" in rawProducts[0];
  if (!migrated && !DRY_RUN) {
    throw new Error("Column products.sap_item_code is missing: apply supabase/migrations/0006_sap_sync.sql first");
  }
  if (rawProducts.length && !("sap_name" in rawProducts[0]) && !DRY_RUN) {
    throw new Error("Column products.sap_name is missing: apply supabase/migrations/0007_sap_name.sql first");
  }
  const products: DbProduct[] = rawProducts.map((p) => ({
    id: p.id as string,
    slug: p.slug as string,
    sap_item_code: p.sap_item_code ?? p.specs?.find((s) => s.key === "Šifra artikla")?.value ?? null,
    name_hr: p.name_hr as string,
    // Before migration 0007 the name column still held the SAP name.
    sap_name: p.sap_name ?? (p.name_hr as string),
    category_id: p.category_id as string,
    sap_description: p.sap_description ?? null,
    description_sl: p.description_sl ?? null,
    description_en: p.description_en ?? null,
    unit: p.unit ?? null,
    active: p.active ?? true,
  }));
  if (!migrated) log("Migration 0006 not applied yet: item codes read from specs (dry run only)");
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));
  const productByCode = new Map(
    products.filter((p) => p.sap_item_code).map((p) => [p.sap_item_code as string, p])
  );
  const usedSlugs = new Set(products.map((p) => p.slug));
  log(`Database: ${products.length} products, ${categories.length} categories`);

  let articles: SapArticle[];
  if (FROM_FILE) {
    const dump = JSON.parse(readFileSync(FROM_FILE, "utf8")) as SapArticle[] | { value: SapArticle[] };
    articles = Array.isArray(dump) ? dump : dump.value;
    log(`Reading SAP rows from ${FROM_FILE}`);
  } else {
    const cookie = await sapLogin();
    try {
      articles = await sapFetchBrand(cookie, log);
    } finally {
      await sapLogout(cookie);
    }
  }
  const sapByCode = new Map(
    articles.filter((a) => (a.Brend ?? "").trim() === BRAND).map((a) => [a.SifraRobe, a])
  );
  log(`SAP rows: ${articles.length}, of which ${BRAND}: ${sapByCode.size}`);

  const nowIso = new Date().toISOString();
  const updates: SyncRow[] = [];
  const inserts: Array<SyncRow & { specs: Array<{ key: string; value: string }> }> = [];
  const notInSap: SelectionEntry[] = [];
  const unknownCategory: SelectionEntry[] = [];
  const changes = {
    name: [] as string[],
    category: [] as string[],
    deactivated: [] as string[],
    reactivated: [] as string[],
    // SAP text changed under an existing translation (data/product-translations.json).
    staleTranslation: [] as string[],
  };
  let descriptionAdded = 0;
  let descriptionChanged = 0;
  let withDescription = 0;

  for (const entry of selection) {
    const sap = sapByCode.get(entry.code);
    if (!sap) {
      // Not guessed: the article stays as it is until SAP has it again.
      notInSap.push(entry);
      continue;
    }
    const categoryId = categoryIdBySlug.get(entry.categorySlug);
    if (!categoryId) {
      unknownCategory.push(entry);
      continue;
    }

    const existing = productByCode.get(entry.code);
    const name = cleanName(sap.NazivRobe);
    const description = (sap.B2BOpisProizvoda ?? "").trim() || null;
    const active = sap.Aktivan === "Y";
    if (description) withDescription += 1;

    let slug = existing?.slug;
    if (!slug) {
      const base = slugify(name);
      slug = usedSlugs.has(base) ? `${base}-${slugify(entry.code)}` : base;
      usedSlugs.add(slug);
    }

    const row: SyncRow = {
      sap_item_code: entry.code,
      slug,
      // The web name is edited by hand; SAP only sets it on a new product.
      name_hr: existing?.name_hr ?? name,
      sap_name: name,
      sap_description: description,
      unit: normalizeUnit(sap.NazivJM),
      category_id: categoryId,
      active,
      sap_updated_at: sap.DatumAzuriranja,
      last_synced_at: nowIso,
    };

    if (existing) {
      if (existing.sap_name !== name) {
        changes.name.push(`${entry.code}: "${existing.sap_name}" → "${name}" (web name "${existing.name_hr}" kept)`);
      }
      if (existing.category_id !== categoryId) {
        changes.category.push(
          `${entry.code} ${name}: ${categorySlugById.get(existing.category_id) ?? "?"} → ${entry.categorySlug}`
        );
      }
      if (existing.active && !active) changes.deactivated.push(`${entry.code} ${name}`);
      if (!existing.active && active) changes.reactivated.push(`${entry.code} ${name}`);
      if (!existing.sap_description && description) descriptionAdded += 1;
      else if (existing.sap_description && description && existing.sap_description !== description) {
        descriptionChanged += 1;
        if (existing.description_sl || existing.description_en) changes.staleTranslation.push(`${entry.code} ${name}`);
      }
      updates.push(row);
    } else {
      inserts.push({
        ...row,
        specs: [
          ...(entry.catalogueNumber ? [{ key: "Kataloški broj", value: entry.catalogueNumber }] : []),
          { key: "Šifra artikla", value: entry.code },
        ],
      });
    }
  }

  // Imported earlier but taken off the selection list: hidden, never deleted.
  const selectedCodes = new Set(selection.map((e) => e.code));
  const dropped = products.filter((p) => p.sap_item_code && !selectedCodes.has(p.sap_item_code) && p.active);
  const withoutCode = products.filter((p) => !p.sap_item_code);

  log("");
  log(`Matched in SAP: ${updates.length + inserts.length} of ${selection.length}`);
  log(`  update existing: ${updates.length}`);
  log(`  new products: ${inserts.length}`);
  log(`  with SAP description: ${withDescription} (new: ${descriptionAdded}, changed: ${descriptionChanged})`);
  const section = (title: string, lines: string[]) => {
    if (!lines.length) return;
    log(`${title} (${lines.length}):`);
    for (const line of lines) log(`  ${line}`);
  };
  section("SAP name changes", changes.name);
  section("SAP description changed, translation needs a look", changes.staleTranslation);
  section("Category changes", changes.category);
  section("Deactivated, inactive in SAP", changes.deactivated);
  section("Reactivated", changes.reactivated);
  section("Not in SAP, left unchanged", notInSap.map((e) => `${e.code} ${e.name}`));
  section("Unknown web category, skipped", unknownCategory.map((e) => `${e.code} → ${e.categorySlug}`));
  section("Off the selection list, deactivated", dropped.map((p) => `${p.sap_item_code} ${p.name_hr}`));
  section("Products without an SAP code, not touched", withoutCode.map((p) => `${p.slug}`));

  if (DRY_RUN) {
    log("");
    log("DRY RUN: nothing written.");
  } else {
    for (const batch of chunk(updates, BATCH_SIZE)) {
      await sb("products?on_conflict=sap_item_code", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(batch),
      });
    }
    for (const batch of chunk(inserts, BATCH_SIZE)) {
      await sb("products?on_conflict=sap_item_code", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(batch),
      });
    }
    for (const batch of chunk(dropped, BATCH_SIZE)) {
      const list = batch.map((p) => `"${p.sap_item_code}"`).join(",");
      await sb(`products?sap_item_code=in.(${list})`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ active: false, last_synced_at: nowIso }),
      });
    }
    log("");
    log(`Written: ${updates.length} updated, ${inserts.length} inserted, ${dropped.length} deactivated`);
  }

  const finishedAt = new Date();
  log(`Finished in ${Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)}s`);

  const outDir = join(process.cwd(), "scripts", ".out");
  mkdirSync(outDir, { recursive: true });
  const stamp = finishedAt.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const reportPath = join(outDir, `sap-import-${stamp}${DRY_RUN ? "-dry" : ""}.txt`);
  writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
