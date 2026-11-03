/**
 * Product images: internal share → PE-LINE Supabase Storage → products.images.
 *
 * Same share and naming as the Petrokov catalog (files named by SAP item code,
 * `0013553_0.jpg`), but only for PE-LINE products and into PE-LINE's own
 * storage. Run from a machine inside the Petrokov network (the share is LAN-only):
 *
 *   npm run sap:images              full run
 *   npm run sap:images -- --dry     scan and report, upload nothing
 *   npm run sap:images -- --force   also replace images a product already has
 *
 * Originals stay on the share. Only webp derivatives are uploaded:
 *
 *   products/<ItemCode>/<index>-1200.webp   product page
 *   products/<ItemCode>/<index>-400.webp    cards (productThumbUrl in src/lib/product-images.ts)
 *
 * products.images holds the 1200px URLs. A product that already has images
 * (uploaded in the admin) keeps them unless --force is passed.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import sharp from "sharp";

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
const FORCE = process.argv.includes("--force");

const SHARE =
  process.env.SAP_IMAGE_SHARE ?? "\\\\192.168.10.184\\B2B Petrokov\\wwwroot\\img\\proizvodi";
const BUCKET = process.env.SUPABASE_PRODUCT_BUCKET ?? "media";
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
// A dry run only reads products, which the public policies allow.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? (DRY_RUN ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" : "");

if (!supabaseUrl || !supabaseKey) {
  console.error(
    `Missing env: NEXT_PUBLIC_SUPABASE_URL, ${DRY_RUN ? "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY" : "SUPABASE_SERVICE_ROLE_KEY"}`
  );
  process.exit(1);
}

const DETAIL_WIDTH = 1200;
const THUMB_WIDTH = 400;
const WEBP_QUALITY = 80;
// Storage starts answering 429 above a handful of parallel uploads.
const CONCURRENCY = 3;

// ---------------------------------------------------------------- names

/**
 * The share has malformed names. These are the patterns seen in the Petrokov
 * run; anything that still fails to parse is reported, never guessed.
 */
function normalizeFileName(name: string) {
  return name
    .trim()
    .replace(/,(jpe?g|png|webp)\./i, ".") // 0044001_0,jpg.jpg
    .replace(/\.(jpe?g|png)\.(jpe?g|png|webp)$/i, ".$2") // 1032576_0.jpg.jpeg
    .replace(/\s+\./, ".") // 0100162_0 .jpg
    .replace(/,\./, ".") // 0015167_0,.webp
    .replace(/\.\.(?=[a-z]+$)/i, ".") // 1031303_0..jpg
    .replace(/^(\d+)-(\d+)\./, "$1_$2.") // 0109585-1.jpg
    .replace(/^(\d+)_\./, "$1_0.") // 1014651_.jpg — empty index means the main image
    .replace(/\.jpe$/i, ".jpg")
    .replace(/\.jfif$/i, ".jpg");
}

type ShareFile = { file: string; code: string; index: number; ext: string };

function parseShareName(name: string): ShareFile | null {
  const m = /^(\d+)(?:_(\d+))?\.(jpe?g|png|webp)$/i.exec(normalizeFileName(name));
  if (!m) return null;
  // A file without _N is the article's only image, same as _0.
  return { file: name, code: m[1], index: m[2] ? Number(m[2]) : 0, ext: m[3].toLowerCase() };
}

// Same code and index in several formats: keep one.
const FORMAT_PRIORITY = ["webp", "jpg", "jpeg", "png"];

// ---------------------------------------------------------------- supabase

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  "Content-Type": "application/json",
};

function publicUrl(path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retries 429/5xx with growing waits; a permanent error fails on the first try. */
async function uploadObject(path: string, body: Buffer, attempts = 5) {
  let lastError = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable",
        "x-upsert": "true",
      },
      body: new Uint8Array(body),
    });
    if (res.ok) return;
    lastError = `${res.status} ${(await res.text()).slice(0, 160)}`;
    if (!(res.status === 429 || res.status >= 500) || attempt === attempts) break;
    await sleep(500 * 2 ** (attempt - 1) + Math.random() * 250);
  }
  throw new Error(`Storage upload ${path}: ${lastError}`);
}

async function mapWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const index = cursor++;
        if (index >= items.length) return;
        await worker(items[index]);
      }
    })
  );
}

// ---------------------------------------------------------------- run

async function main() {
  const startedAt = new Date();
  const report: string[] = [];
  const log = (line: string) => {
    console.log(line);
    report.push(line);
  };

  log(`PE-LINE image sync started ${startedAt.toISOString()}${DRY_RUN ? " (DRY RUN)" : ""}`);
  log(`Share: ${SHARE}`);
  log(`Bucket: ${BUCKET}`);

  const res = await fetch(`${supabaseUrl}/rest/v1/products?select=sap_item_code,name_hr,images,active&limit=10000`, {
    headers,
  });
  if (!res.ok) throw new Error(`Supabase GET products: ${res.status} ${await res.text()}`);
  const products = ((await res.json()) as Array<{
    sap_item_code: string | null;
    name_hr: string;
    images: string[] | null;
    active: boolean;
  }>).filter((p) => p.sap_item_code);
  const productByCode = new Map(products.map((p) => [p.sap_item_code as string, p]));
  log(`Products with an SAP code: ${products.length}`);

  const imageNames = readdirSync(SHARE, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => [".jpg", ".jpeg", ".jpe", ".png", ".webp", ".jfif"].includes(extname(name).toLowerCase()));
  log(`Image files on the share: ${imageNames.length}`);

  // Group the share's files by PE-LINE item code, one file per index, best format wins.
  const byCode = new Map<string, Map<number, ShareFile>>();
  const unparsedForUs: string[] = [];
  for (const name of imageNames) {
    const entry = parseShareName(name);
    if (!entry) {
      // Only worth reporting when the name still looks like one of our codes.
      if ([...productByCode.keys()].some((code) => name.startsWith(code))) unparsedForUs.push(name);
      continue;
    }
    if (!productByCode.has(entry.code)) continue;
    const perIndex = byCode.get(entry.code) ?? new Map<number, ShareFile>();
    const current = perIndex.get(entry.index);
    if (!current || FORMAT_PRIORITY.indexOf(entry.ext) < FORMAT_PRIORITY.indexOf(current.ext)) {
      perIndex.set(entry.index, entry);
    }
    byCode.set(entry.code, perIndex);
  }

  const withImages = [...byCode.keys()];
  const withoutImages = products.filter((p) => !byCode.has(p.sap_item_code as string));
  const keepExisting = withImages.filter((code) => !FORCE && (productByCode.get(code)?.images?.length ?? 0) > 0);
  const todo = withImages.filter((code) => !keepExisting.includes(code));
  const fileCount = todo.reduce((sum, code) => sum + (byCode.get(code)?.size ?? 0), 0);

  log("");
  log(`Products with images on the share: ${withImages.length}`);
  log(`  to upload: ${todo.length} products, ${fileCount} images`);
  log(`  kept, already have images (use --force to replace): ${keepExisting.length}`);
  log(`  with a gallery (>1 image): ${withImages.filter((code) => (byCode.get(code)?.size ?? 0) > 1).length}`);
  if (withoutImages.length) {
    log(`Products without an image on the share (${withoutImages.length}):`);
    for (const p of withoutImages) log(`  ${p.sap_item_code} ${p.name_hr}`);
  }
  if (unparsedForUs.length) {
    log(`Files that look like ours but do not parse (${unparsedForUs.length}), check by hand:`);
    for (const name of unparsedForUs) log(`  ${name}`);
  }

  if (DRY_RUN) {
    log("");
    log("DRY RUN: nothing uploaded.");
  } else {
    let uploaded = 0;
    let patched = 0;
    const failures: string[] = [];

    await mapWithConcurrency(todo, CONCURRENCY, async (code) => {
      const files = [...(byCode.get(code) as Map<number, ShareFile>).values()].sort((a, b) => a.index - b.index);
      const urls: string[] = [];
      for (const entry of files) {
        try {
          const source = readFileSync(join(SHARE, entry.file));
          // Never upscaled; the aspect ratio is kept, nothing is cropped.
          const detail = await sharp(source).rotate().resize({ width: DETAIL_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY }).toBuffer();
          const thumb = await sharp(source).rotate().resize({ width: THUMB_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY }).toBuffer();
          const detailPath = `products/${code}/${entry.index}-${DETAIL_WIDTH}.webp`;
          await uploadObject(detailPath, detail);
          await uploadObject(`products/${code}/${entry.index}-${THUMB_WIDTH}.webp`, thumb);
          urls.push(publicUrl(detailPath));
          uploaded += 1;
        } catch (error) {
          failures.push(`${entry.file}: ${error instanceof Error ? error.message : error}`);
        }
      }
      // Only images that reached storage go on the product, so a failed upload
      // never leaves a dead link; if all failed, the product is left as it was.
      if (!urls.length) return;
      const patch = await fetch(`${supabaseUrl}/rest/v1/products?sap_item_code=eq.${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ images: urls }),
      });
      if (patch.ok) patched += 1;
      else failures.push(`db ${code}: ${patch.status} ${(await patch.text()).slice(0, 120)}`);
      process.stderr.write(`\rimages: ${uploaded}/${fileCount}`);
    });
    process.stderr.write("\n");

    log("");
    log(`Uploaded: ${uploaded} images, products updated: ${patched}`);
    if (failures.length) {
      log(`Failed (${failures.length}):`);
      for (const line of failures) log(`  ${line}`);
    }
  }

  const finishedAt = new Date();
  log(`Finished in ${Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)}s`);

  const outDir = join(process.cwd(), "scripts", ".out");
  mkdirSync(outDir, { recursive: true });
  const stamp = finishedAt.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const reportPath = join(outDir, `sap-images-${stamp}${DRY_RUN ? "-dry" : ""}.txt`);
  writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
