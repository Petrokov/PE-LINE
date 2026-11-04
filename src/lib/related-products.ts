import manual from "../../data/related-products.json";

/**
 * Related products for the product page: "goes with this product" (complementary)
 * and "similar products". Complementary products come from the rules below, matched
 * on dimensions read from the Croatian web name, with per-article overrides in
 * data/related-products.json (keyed by SAP item code).
 */

export type RelatedCandidate = {
  id: string;
  name_hr: string;
  product_type?: string | null;
  sap_item_code?: string | null;
  categorySlug: string;
};

type Target = { category: string; type?: string; match?: RegExp };

/** "category/type" (or "category" for any type) → what goes with it, in display order. */
const RULES: Record<string, Target[]> = {
  "dimovodi/cijevi": [
    { category: "dimovodi", type: "koljena" },
    { category: "dimovodi", type: "t-komadi" },
    { category: "dimovodi", type: "obujmice-rozete" },
    { category: "dimovodi", type: "pribor" },
  ],
  "dimovodi/koljena": [
    { category: "dimovodi", type: "cijevi" },
    { category: "dimovodi", type: "t-komadi" },
    { category: "dimovodi", type: "obujmice-rozete" },
  ],
  "dimovodi/t-komadi": [
    { category: "dimovodi", type: "cijevi" },
    { category: "dimovodi", type: "koljena" },
    { category: "dimovodi", type: "pribor" },
  ],
  "dimovodi/setovi": [
    { category: "dimovodi", type: "cijevi" },
    { category: "dimovodi", type: "koljena" },
    { category: "dimovodi", type: "obujmice-rozete" },
  ],
  "dimovodi/fleksibilne-cijevi": [
    { category: "dimovodi", type: "pribor", match: /fleksibiln|okn/i },
    { category: "dimovodi", type: "pribor" },
  ],
  "dimovodi/obujmice-rozete": [
    { category: "dimovodi", type: "cijevi" },
    { category: "dimovodi", type: "koljena" },
  ],
  "dimovodi/pribor": [
    { category: "dimovodi", type: "cijevi" },
    { category: "dimovodi", type: "koljena" },
  ],

  "podno-grijanje/cijevi": [
    { category: "podno-grijanje", type: "ploce" },
    { category: "podno-grijanje", type: "razdjelnici" },
    { category: "instalacije", type: "ostalo", match: /PEX|holender/i },
    { category: "podno-grijanje", type: "alati-pribor" },
  ],
  "podno-grijanje/razdjelnici": [
    { category: "ormarici" },
    { category: "podno-grijanje", type: "termopogoni" },
    { category: "instalacije", type: "ostalo", match: /PEX|holender/i },
    { category: "podno-grijanje", type: "cijevi" },
  ],
  "podno-grijanje/ploce": [
    { category: "podno-grijanje", type: "cijevi" },
    { category: "podno-grijanje", type: "alati-pribor" },
    { category: "podno-grijanje", type: "razdjelnici" },
  ],
  "podno-grijanje/grijace-mreze": [
    { category: "regulacije", match: /električno podno/i },
  ],
  "podno-grijanje/termopogoni": [
    { category: "podno-grijanje", type: "razdjelnici" },
    { category: "instalacije", type: "razdjelnici" },
    { category: "podno-grijanje", type: "bazne-jedinice" },
    { category: "regulacije", type: "zicani" },
  ],
  "podno-grijanje/bazne-jedinice": [
    { category: "podno-grijanje", type: "termopogoni" },
    { category: "regulacije", type: "zicani" },
    { category: "podno-grijanje", type: "razdjelnici" },
  ],
  "podno-grijanje/alati-pribor": [
    { category: "podno-grijanje", type: "cijevi" },
    { category: "podno-grijanje", type: "ploce" },
  ],

  ormarici: [
    { category: "podno-grijanje", type: "razdjelnici" },
    { category: "instalacije", type: "razdjelnici" },
    { category: "podno-grijanje", type: "termopogoni" },
  ],

  "instalacije/razdjelnici": [
    { category: "ormarici" },
    { category: "podno-grijanje", type: "termopogoni" },
    { category: "podno-grijanje", type: "cijevi" },
    { category: "instalacije", type: "ostalo", match: /PEX|holender/i },
  ],
  "instalacije/mijesajuci-ventili": [
    { category: "instalacije", type: "pogoni" },
    { category: "instalacije", type: "ostalo", match: /termometar/i },
    { category: "instalacije", type: "kuglasti-ventili" },
  ],
  "instalacije/pogoni": [{ category: "instalacije", type: "mijesajuci-ventili" }],
  "instalacije/kuglasti-ventili": [
    { category: "instalacije", type: "mijesajuci-ventili" },
    { category: "instalacije", type: "ostalo", match: /termometar/i },
  ],
  "instalacije/ostalo": [
    { category: "podno-grijanje", type: "cijevi", match: /16 × 2/ },
    { category: "instalacije", type: "mijesajuci-ventili" },
  ],

  "regulacije/zicani": [
    { category: "podno-grijanje", type: "bazne-jedinice" },
    { category: "podno-grijanje", type: "termopogoni" },
  ],
  "regulacije/bezicni": [
    { category: "podno-grijanje", type: "bazne-jedinice" },
    { category: "podno-grijanje", type: "termopogoni" },
  ],
  "regulacije/wifi": [
    { category: "podno-grijanje", type: "bazne-jedinice" },
    { category: "podno-grijanje", type: "termopogoni" },
  ],

  "spremnici/spremnici-tople-vode": [
    { category: "spremnici", type: "grijaci", match: /REU|EBH/ },
    { category: "spremnici", type: "medjuspremnici" },
  ],
  "spremnici/medjuspremnici": [
    { category: "spremnici", type: "grijaci", match: /Hottech/ },
    { category: "spremnici", type: "spremnici-tople-vode", match: /dizalicu topline/ },
    { category: "instalacije", type: "mijesajuci-ventili" },
  ],
  "spremnici/grijaci": [
    { category: "spremnici", type: "spremnici-tople-vode" },
    { category: "spremnici", type: "medjuspremnici" },
  ],

  "ventilokonvektori/ventilokonvektori": [
    { category: "ventilokonvektori", type: "regulacija" },
    { category: "ventilokonvektori", type: "pribor" },
  ],
  "ventilokonvektori/regulacija": [
    { category: "ventilokonvektori", type: "ventilokonvektori" },
    { category: "ventilokonvektori", type: "pribor" },
  ],
  "ventilokonvektori/pribor": [
    { category: "ventilokonvektori", type: "ventilokonvektori" },
    { category: "ventilokonvektori", type: "regulacija" },
  ],

  bojleri: [{ category: "spremnici", match: /ispod bojlera/i }],
};

export const RELATED_LIMIT = 8;

/** Dimensions read from the web name; a missing value never excludes a match. */
type Attrs = {
  /** Flue diameter as written, e.g. "60/100" or "80". */
  flue?: string;
  /** Outer flue diameter, which is what rosettes and brackets are sized by. */
  flueOuter?: string;
  pellet: boolean;
  /** Circuit count of a manifold. */
  circuits?: number;
  /** Circuit range a cabinet takes. */
  circuitRange?: [number, number];
  /** Actuator thread, matched against the manifold's "TOP 30 × 1,5". */
  thread?: string;
  voltage?: string;
};

function attrs(p: RelatedCandidate): Attrs {
  const name = p.name_hr;
  const a: Attrs = { pellet: /pelet/i.test(name) };

  if (p.categorySlug === "dimovodi") {
    const m = name.match(/Ø(\d+)(?:\/(\d+))?/);
    if (m) {
      a.flue = m[2] ? `${m[1]}/${m[2]}` : m[1];
      a.flueOuter = m[2] ?? m[1];
    }
  }

  const range = name.match(/(\d+)–(\d+) krug/);
  const upTo = name.match(/do (\d+) krug/);
  const count = name.match(/(\d+) krug/);
  if (p.categorySlug === "ormarici") {
    if (range) a.circuitRange = [Number(range[1]), Number(range[2])];
    else if (upTo) a.circuitRange = [1, Number(upTo[1])];
  } else if (count) {
    a.circuits = Number(count[1]);
  }

  const thread = name.match(/\bM(\d+) × 1,5/) ?? name.match(/\bTOP (\d+) × 1,5/);
  if (thread) a.thread = thread[1];

  const volt = name.match(/\b(\d+) ?V\b/);
  if (volt) a.voltage = volt[1];
  return a;
}

const isFlueFitting = (p: RelatedCandidate) => p.product_type === "obujmice-rozete";

/**
 * Whether two products fit together, and how well (lower is better).
 * null = they do not fit (different flue size, thread, voltage, too few circuits).
 */
function fit(a: RelatedCandidate, b: RelatedCandidate): number | null {
  const x = attrs(a);
  const y = attrs(b);
  let score = 0;

  if (x.flue && y.flue) {
    if (isFlueFitting(a) || isFlueFitting(b)) {
      if (x.flueOuter !== y.flueOuter) return null;
    } else if (x.flue !== y.flue || x.pellet !== y.pellet) {
      return null;
    }
  } else if (x.flue || y.flue) {
    score += 1; // generic part (e.g. roof bracket) after the exact-size ones
  }

  if (x.thread && y.thread && x.thread !== y.thread) return null;
  if (x.voltage && y.voltage && x.voltage !== y.voltage) return null;

  // Manifold ↔ cabinet: the cabinet must take the manifold's circuits; the tightest fit first.
  const circuits = x.circuits ?? y.circuits;
  const range = x.circuitRange ?? y.circuitRange;
  if (circuits !== undefined && range) {
    if (circuits < range[0] || circuits > range[1]) return null;
    score += range[1] - circuits;
  } else if (circuits !== undefined && (a.categorySlug === "ormarici" || b.categorySlug === "ormarici")) {
    score += 50; // cabinet without a stated circuit count: after the ones known to fit
  }
  return score;
}

function ruleFor(p: RelatedCandidate): Target[] {
  return RULES[`${p.categorySlug}/${p.product_type}`] ?? RULES[p.categorySlug] ?? [];
}

function matches(t: Target, c: RelatedCandidate) {
  return (
    c.categorySlug === t.category &&
    (t.type === undefined || c.product_type === t.type) &&
    (t.match === undefined || t.match.test(c.name_hr))
  );
}

type Override = { add?: string[]; remove?: string[]; only?: boolean };
const OVERRIDES = manual as Record<string, Override | string>;

/** Products that go with `product`: manual additions first, then the rules, round-robin across groups. */
export function complementaryProducts<T extends RelatedCandidate>(product: RelatedCandidate, pool: T[]): T[] {
  const override = product.sap_item_code ? OVERRIDES[product.sap_item_code] : undefined;
  const o = typeof override === "object" ? override : {};
  const byCode = new Map(pool.filter((p) => p.sap_item_code).map((p) => [p.sap_item_code!, p]));
  const removed = new Set(o.remove ?? []);
  const picked: T[] = [];
  const seen = new Set<string>([product.id]);
  const take = (p: T | undefined) => {
    if (!p || seen.has(p.id) || (p.sap_item_code && removed.has(p.sap_item_code))) return;
    seen.add(p.id);
    picked.push(p);
  };

  for (const code of o.add ?? []) take(byCode.get(code));
  if (o.only) return picked.slice(0, RELATED_LIMIT);

  const groups = ruleFor(product).map((t) =>
    pool
      .filter((c) => matches(t, c))
      .map((c) => ({ c, score: fit(product, c) }))
      .filter((r): r is { c: T; score: number } => r.score !== null)
      .sort((a, b) => a.score - b.score || a.c.name_hr.localeCompare(b.c.name_hr, "hr", { numeric: true }))
      .map((r) => r.c)
  );
  // Round-robin, so one large group (12 elbows) does not crowd out the others.
  for (let i = 0; picked.length < RELATED_LIMIT && groups.some((g) => g.length > i); i++) {
    for (const g of groups) if (picked.length < RELATED_LIMIT) take(g[i]);
  }
  return picked.slice(0, RELATED_LIMIT);
}

/**
 * Same category and type (same flue size first), excluding what is already shown as complementary.
 * A type with too few other items is topped up from the rest of the category.
 */
export function similarProducts<T extends RelatedCandidate>(
  product: RelatedCandidate,
  pool: T[],
  exclude: Iterable<string> = []
): T[] {
  const skip = new Set([product.id, ...exclude]);
  const self = attrs(product);
  return pool
    .filter((c) => !skip.has(c.id) && c.categorySlug === product.categorySlug)
    .map((c) => {
      const a = attrs(c);
      const sameSize = self.flue !== undefined && a.flue === self.flue && a.pellet === self.pellet;
      const sameType = !product.product_type || c.product_type === product.product_type;
      // Nearest size first: manifolds by circuit count, cabinets by the largest count they take.
      const size = (x: Attrs) => x.circuits ?? x.circuitRange?.[1];
      const near = size(self) !== undefined && size(a) !== undefined ? Math.abs(size(self)! - size(a)!) / 100 : 0;
      return { c, score: (sameType ? 0 : 2) + (sameSize ? 0 : 1) + near, sameType };
    })
    .filter((r, _, all) => r.sameType || all.filter((x) => x.sameType).length < 4)
    .sort((a, b) => a.score - b.score || a.c.name_hr.localeCompare(b.c.name_hr, "hr", { numeric: true }))
    .slice(0, RELATED_LIMIT)
    .map((r) => r.c);
}
