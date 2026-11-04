"""Product type per item code, from the web name (HR) and site category.
Run from pe-line-web: python -I supabase/scripts/gen_product_types.py data/product-translations.json data/sap-selection.csv data/product-types.json
"""
import csv, json, sys

names = json.load(open(sys.argv[1], encoding="utf-8"))
cats = {r[0]: r[3] for r in csv.reader(open(sys.argv[2], encoding="utf-8-sig"), delimiter=";") if r[0] != "ItemCode"}


def kind(cat, n):
    low = n.lower()
    if cat == "dimovodi":
        if low.startswith("fleksibilna"): return "fleksibilne-cijevi"
        if low.startswith("dimovodna cijev"): return "cijevi"
        if "koljeno" in low: return "koljena"
        if "t-komad" in low: return "t-komadi"
        if " set" in low or low.startswith("dimovodni set"): return "setovi"
        if "obujmica" in low or "rozeta" in low: return "obujmice-rozete"
        return "pribor"
    if cat == "podno-grijanje":
        if low.startswith("cijev"): return "cijevi"
        if low.startswith("razdjelnik"): return "razdjelnici"
        if "raster ploča" in low or "tacker ploča" in low: return "ploce"
        if "grijaća mreža" in low: return "grijace-mreze"
        if low.startswith("termopogon"): return "termopogoni"
        if low.startswith("bazna jedinica"): return "bazne-jedinice"
        return "alati-pribor"
    if cat == "ormarici":
        if "slim" in low:
            return "slim-80" if "× 80 mm" in n else "slim-110"
        if "575–665" in n: return "podesivi"
        return "standardni"
    if cat == "radijatori":
        return "srednji-prikljucak" if "srednjim priključkom" in low else "bocni-prikljucak"
    if cat == "instalacije":
        if "miješajući ventil" in low and not low.startswith("pogon"): return "mijesajuci-ventili"
        if low.startswith("pogon"): return "pogoni"
        if low.startswith("kuglasti ventil"): return "kuglasti-ventili"
        if low.startswith("razdjelnik"): return "razdjelnici"
        return "ostalo"
    if cat == "spremnici":
        if "međuspremnik" in low: return "medjuspremnici"
        if "grijač" in low: return "grijaci"
        return "spremnici-tople-vode"
    if cat == "ventilokonvektori":
        if low.startswith(("parapetni ventilokonvektor", "kanalni ventilokonvektor")): return "ventilokonvektori"
        if "regulacija" in low: return "regulacija"
        return "pribor"
    if cat == "regulacije":
        if "wi-fi" in low: return "wifi"
        if low.startswith("bežični"): return "bezicni"
        return "zicani"
    return None  # bojleri: too few products to filter


out = {code: kind(cats[code], v["name_hr"]) for code, v in sorted(names.items())}
json.dump(out, open(sys.argv[3], "w", encoding="utf-8", newline="\n"), ensure_ascii=False, indent=2)

import collections
by = collections.defaultdict(list)
for code, t in out.items():
    by[(cats[code], t)].append(names[code]["name_hr"])
with open(sys.argv[3].replace(".json", "-review.txt"), "w", encoding="utf-8") as f:
    for (c, t), ns in sorted(by.items(), key=lambda kv: (kv[0][0], str(kv[0][1]))):
        f.write(f"## {c} / {t} ({len(ns)})\n")
        for n in sorted(ns):
            f.write(f"   {n}\n")
print(len(out), "codes;", collections.Counter((cats[c], t) for c, t in out.items()))
