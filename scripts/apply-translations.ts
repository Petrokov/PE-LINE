/**
 * Writes the edited web names and SL/EN translations from
 * data/product-translations.json into products, matched by SAP item code.
 *
 *   npm run translations:apply             write
 *   npm run translations:apply -- --dry    compare, write nothing
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (a dry run can do with the
 * anon key) and supabase/migrations/0007_sap_name.sql, which moves the SAP
 * name to sap_name before name_hr becomes the web name.
 *
 * The SAP import never touches these columns, so translations survive it; its
 * report lists products whose SAP description changed under a translation.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

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
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? (DRY_RUN ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" : "");
if (!supabaseUrl || !supabaseKey) {
  console.error(`Missing env: NEXT_PUBLIC_SUPABASE_URL, ${DRY_RUN ? "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY" : "SUPABASE_SERVICE_ROLE_KEY"}`);
  process.exit(1);
}

type Translation = {
  name_hr: string;
  name_sl: string;
  name_en: string;
  description_hr?: string;
  description_sl?: string;
  description_en?: string;
  /** The SAP description the translation was made from. */
  source_description?: string;
  /** Why the description was left untranslated. */
  review?: string;
};

const FIELDS = ["name_hr", "name_sl", "name_en", "description_hr", "description_sl", "description_en"] as const;

const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" };

async function main() {
  const report: string[] = [];
  const log = (line: string) => {
    console.log(line);
    report.push(line);
  };
  log(`Product translations ${new Date().toISOString()}${DRY_RUN ? " (DRY RUN)" : ""}`);

  const translations = JSON.parse(
    readFileSync(join(process.cwd(), "data", "product-translations.json"), "utf8")
  ) as Record<string, Translation>;

  const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*&sap_item_code=not.is.null&limit=10000`, { headers });
  if (!res.ok) throw new Error(`Supabase GET products: ${res.status} ${await res.text()}`);
  const products = (await res.json()) as Array<Record<string, string | null> & { sap_item_code: string }>;

  const migrated = products.length > 0 && "sap_name" in products[0];
  if (!migrated) {
    const message = "Column products.sap_name is missing: apply supabase/migrations/0007_sap_name.sql first";
    if (!DRY_RUN) throw new Error(message);
    log(`${message} (dry run continues)`);
  }

  const byCode = new Map(products.map((p) => [p.sap_item_code, p]));
  const patches: Array<{ code: string; changes: Partial<Record<(typeof FIELDS)[number], string>> }> = [];
  const notInDb: string[] = [];
  const staleSource: string[] = [];
  const flagged: string[] = [];

  for (const [code, t] of Object.entries(translations)) {
    const product = byCode.get(code);
    if (!product) {
      notInDb.push(code);
      continue;
    }
    if (t.review) flagged.push(`${code} ${t.name_hr}: ${t.review}`);
    if (t.source_description && product.sap_description && product.sap_description.trim() !== t.source_description.trim()) {
      staleSource.push(`${code} ${t.name_hr}`);
    }
    const changes: Partial<Record<(typeof FIELDS)[number], string>> = {};
    for (const field of FIELDS) {
      const value = t[field];
      if (value && value !== product[field]) changes[field] = value;
    }
    if (Object.keys(changes).length) patches.push({ code, changes });
  }

  const count = (field: (typeof FIELDS)[number]) => patches.filter((p) => field in p.changes).length;
  log(`Translations: ${Object.keys(translations).length}, products to update: ${patches.length}`);
  for (const field of FIELDS) log(`  ${field}: ${count(field)}`);
  const section = (title: string, lines: string[]) => {
    if (!lines.length) return;
    log(`${title} (${lines.length}):`);
    for (const line of lines) log(`  ${line}`);
  };
  section("Not in the database", notInDb);
  section("SAP description changed since translating, check the translation", staleSource);
  section("Description left untranslated, needs the client", flagged);

  if (DRY_RUN) {
    log("DRY RUN: nothing written.");
  } else {
    let written = 0;
    for (const { code, changes } of patches) {
      const patch = await fetch(`${supabaseUrl}/rest/v1/products?sap_item_code=eq.${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify(changes),
      });
      if (!patch.ok) throw new Error(`Supabase PATCH ${code}: ${patch.status} ${await patch.text()}`);
      written += 1;
    }
    log(`Written: ${written} products`);
  }

  const outDir = join(process.cwd(), "scripts", ".out");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const reportPath = join(outDir, `translations-${stamp}${DRY_RUN ? "-dry" : ""}.txt`);
  writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
