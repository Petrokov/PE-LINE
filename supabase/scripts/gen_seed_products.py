# Usage: python supabase/scripts/gen_seed_products.py "<odabir proizvoda.xlsx>" supabase/migrations/0005_seed_confirmed_products.sql
import collections, json, re, sys, unicodedata
import openpyxl

XLSX, OUT = sys.argv[1], sys.argv[2]

# Site category slug -> (name_hr, name_sl, name_en, icon, sort_order, description_hr)
NEW_CATEGORIES = {
    "bojleri": ("Bojleri i kotlovi", "Grelniki vode in kotli", "Water heaters and boilers", "Flame", 8,
                "Električni bojleri i kotlovi za pripremu potrošne tople vode i grijanje."),
    "instalacije": ("Instalacije", "Instalacije", "Installations", "SlidersHorizontal", 9,
                    "Armature, ventili, razdjelnici i ostala oprema za instalacije grijanja."),
}
EXISTING = ["dimovodi", "ormarici", "podno-grijanje", "radijatori", "regulacije", "spremnici", "ventilokonvektori"]


def site_category(r):
    web, pg1, pg2, pg3, name = r[1], r[10], r[11], r[12], (r[5] or "").upper()
    if web == "Bojleri":
        return "dimovodi" if pg2 == "DIMOVODI" else "bojleri"
    if web == "Podno grijanje (+ regulacija)":
        if pg1 == "REGULACIJA" or pg3 == "Podno grijanje - Regulacija":
            return "regulacije"
        if "ORMARI" in name:
            return "ormarici"
        return "podno-grijanje"
    return {
        "Radijatori": "radijatori",
        "Spremnici i puferi": "spremnici",
        "Klimatizacija (ventilokonvektori)": "ventilokonvektori",
        "Instalacije": "instalacije",
    }[web]


def slugify(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("đ", "d").replace("Đ", "d").lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def q(s):
    return "null" if s is None else "'" + str(s).replace("'", "''") + "'"


wb = openpyxl.load_workbook(XLSX, data_only=True)
rows = [r for r in list(wb["Proizvodi"].iter_rows(values_only=True))[1:] if r[3] and r[0] == "OSTAJE"]

products, used = [], collections.Counter()
for r in rows:
    name = re.sub(r"\s+", " ", r[5]).strip()
    base = slugify(name)
    used[base] += 1
    products.append((r, name, base))
dupes = {b for b, n in used.items() if n > 1}

seen, out_rows = set(), []
for r, name, base in products:
    slug = f"{base}-{slugify(str(r[4]))}" if base in dupes else base
    assert slug not in seen, slug
    seen.add(slug)
    specs = [{"key": "Kataloški broj", "value": str(r[4])}, {"key": "Šifra artikla", "value": str(r[3])}]
    out_rows.append((site_category(r), name, slug, specs, r[3]))

counts = collections.Counter(c for c, *_ in out_rows)
L = []
L.append("-- Import of client-confirmed product selection (status OSTAJE) from")
L.append("-- 'Copy of PE-LINE web - odabir proizvoda.xlsx', confirmed 2026-10-09.")
L.append(f"-- {len(out_rows)} products: " + ", ".join(f"{k} {v}" for k, v in sorted(counts.items())))
L.append("-- Generated file — regenerate from the spreadsheet instead of editing by hand.")
L.append("")
L.append("-- Root category, only when no category tree exists yet (site lists children of a root).")
L.append("insert into categories (name_hr, name_sl, name_en, slug, sort_order)")
L.append("select 'Proizvodi', 'Izdelki', 'Products', 'proizvodi', 0")
L.append("where not exists (select 1 from categories where parent_id is not null)")
L.append("on conflict (slug) do nothing;")
L.append("")
L.append("-- Site categories; new ones join the same parent as the existing ones.")
L.append("with root as (")
L.append("  select coalesce(")
L.append("    (select parent_id from categories where parent_id is not null order by sort_order limit 1),")
L.append("    (select id from categories where slug = 'proizvodi')")
L.append("  ) as id")
L.append(")")
L.append("insert into categories (name_hr, name_sl, name_en, slug, icon, sort_order, description_hr, parent_id)")
L.append("select v.name_hr, v.name_sl, v.name_en, v.slug, v.icon, v.sort_order, v.description_hr, root.id")
L.append("from root, (values")
existing_names = {
    "dimovodi": ("Dimovodi", "Dimovodi", "Flue pipes", "Flame", 1),
    "ormarici": ("Ormarići", "Omarice", "Cabinets", "Columns3", 2),
    "podno-grijanje": ("Podno grijanje", "Talno ogrevanje", "Underfloor heating", "Layers", 3),
    "radijatori": ("Radijatori", "Radiatorji", "Radiators", "Thermometer", 4),
    "regulacije": ("Regulacije", "Regulacije", "Controls", "Settings", 5),
    "spremnici": ("Spremnici", "Zbiralniki", "Tanks", "Box", 6),
    "ventilokonvektori": ("Ventilokonvektori", "Ventilatorski konvektorji", "Fan coil units", "Wind", 7),
}
vals = [(s, *existing_names[s], None) for s in EXISTING] + [(s, *v) for s, v in NEW_CATEGORIES.items()]
L.append(",\n".join(
    f"  ({q(n)}, {q(sl)}, {q(en)}, {q(s)}, {q(i)}, {o}, {q(d)})" for s, n, sl, en, i, o, d in vals
))
L.append(") as v(name_hr, name_sl, name_en, slug, icon, sort_order, description_hr)")
L.append("on conflict (slug) do nothing;")
L.append("")
L.append("-- Products. Re-running updates name/category/specs but keeps images and descriptions.")
L.append("insert into products (name_hr, slug, specs, category_id)")
L.append("select v.name_hr, v.slug, v.specs::jsonb, c.id")
L.append("from (values")
L.append(",\n".join(
    f"  ({q(n)}, {q(s)}, {q(json.dumps(sp, ensure_ascii=False))}, {q(c)})" for c, n, s, sp, _ in out_rows
))
L.append(") as v(name_hr, slug, specs, category_slug)")
L.append("join categories c on c.slug = v.category_slug")
L.append("on conflict (slug) do update set")
L.append("  name_hr = excluded.name_hr,")
L.append("  specs = excluded.specs,")
L.append("  category_id = excluded.category_id;")
L.append("")

with open(OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(L))
print(len(out_rows), dict(counts), "dupes:", len(dupes))
