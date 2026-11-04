/**
 * Writes product types from data/product-types.json into products.product_type,
 * matched by SAP item code. The types drive the filter on the products pages
 * (keys and order: src/lib/product-types.ts).
 *
 *   npm run types:apply             write
 *   npm run types:apply -- --dry    compare, write nothing
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (a dry run can do with the
 * anon key) and supabase/migrations/0008_product_type.sql.
 */

import { readFileSync } from "node:fs";
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

const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" };

async function main() {
  const types = JSON.parse(readFileSync(join(process.cwd(), "data", "product-types.json"), "utf8")) as Record<
    string,
    string | null
  >;

  const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*&sap_item_code=not.is.null&limit=10000`, { headers });
  if (!res.ok) throw new Error(`Supabase GET products: ${res.status} ${await res.text()}`);
  const products = (await res.json()) as Array<{ sap_item_code: string; name_hr: string; product_type?: string | null }>;

  if (products.length && !("product_type" in products[0])) {
    const message = "Column products.product_type is missing: apply supabase/migrations/0008_product_type.sql first";
    if (!DRY_RUN) throw new Error(message);
    console.log(`${message} (dry run continues)`);
  }

  const changes = products.filter((p) => (types[p.sap_item_code] ?? null) !== (p.product_type ?? null));
  const untyped = products.filter((p) => !(p.sap_item_code in types));
  console.log(`Products: ${products.length}, types in file: ${Object.keys(types).length}, to update: ${changes.length}`);
  if (untyped.length) {
    console.log(`No type in data/product-types.json (${untyped.length}):`);
    for (const p of untyped) console.log(`  ${p.sap_item_code} ${p.name_hr}`);
  }

  if (DRY_RUN) {
    console.log("DRY RUN: nothing written.");
    return;
  }
  for (const p of changes) {
    const patch = await fetch(`${supabaseUrl}/rest/v1/products?sap_item_code=eq.${encodeURIComponent(p.sap_item_code)}`, {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ product_type: types[p.sap_item_code] ?? null }),
    });
    if (!patch.ok) throw new Error(`Supabase PATCH ${p.sap_item_code}: ${patch.status} ${await patch.text()}`);
  }
  console.log(`Written: ${changes.length} products`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
