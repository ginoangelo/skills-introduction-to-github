#!/usr/bin/env python3
"""Builds public/labor-data.js: a labor cost index for every 3-digit ZIP prefix.

Sources, both free and public:
- US Census Bureau: 2020 ZIP-area-to-county file and the 2023 metro area list.
- US Bureau of Labor Statistics, Occupational Employment and Wage Statistics:
  mean hourly wage for construction and extraction occupations (group 47-0000)
  by metro area, by state and nationally.

index = local construction wage / national construction wage.
These are wages, not what a contractor bills, so the index only scales labor
up or down by area. Re-run once a year when BLS publishes new figures.

Needs: python3, openpyxl, network access to www2.census.gov and api.bls.gov.
Set BLS_API_KEY to a free key from https://data.bls.gov/registrationEngine/
(500 requests a day). Without a key BLS allows 25 requests a day per network
address, which a shared address can exhaust. Responses are cached in
scripts/.cache, so a run that stops at the cap picks up where it left off.
"""
import collections, json, os, sys, time, urllib.request
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
OUT = os.path.join(HERE, "..", "public", "labor-data.js")
ZCTA_URL = "https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt"
CBSA_URL = "https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx"
BLS_URL = "https://api.bls.gov/publicAPI/v1/timeseries/data/"
OCC = "470000"  # construction and extraction occupations
STATES = {"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"}


def fetch(url, name):
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        os.makedirs(CACHE, exist_ok=True)
        urllib.request.urlretrieve(url, path)
    return path


def county_to_metro():
    ws = openpyxl.load_workbook(fetch(CBSA_URL, "list1_2023.xlsx"), read_only=True).active
    rows = ws.iter_rows(values_only=True)
    for row in rows:
        if row and row[0] == "CBSA Code":
            head = list(row)
            break
    col = {h: i for i, h in enumerate(head)}
    out = {}
    for row in rows:
        if not row or not row[0] or not str(row[0]).isdigit():
            continue
        if row[col["Metropolitan/Micropolitan Statistical Area"]] != "Metropolitan Statistical Area":
            continue
        fips = str(row[col["FIPS State Code"]]).zfill(2) + str(row[col["FIPS County Code"]]).zfill(3)
        out[fips] = (str(row[0]), row[col["CBSA Title"]])
    return out


def zip3_areas(metro_of):
    """For each ZIP prefix, the metro (or state) that most of its ZIP areas fall in."""
    best = {}  # zcta -> (land area of overlap, county fips)
    with open(fetch(ZCTA_URL, "zcta_county.txt"), encoding="utf-8-sig") as f:
        head = f.readline().rstrip("\n").split("|")
        zi, ci, ai = head.index("GEOID_ZCTA5_20"), head.index("GEOID_COUNTY_20"), head.index("AREALAND_PART")
        for line in f:
            p = line.rstrip("\n").split("|")
            if not p[zi] or p[ci][:2] not in STATES:
                continue
            area = int(p[ai] or 0)
            if p[zi] not in best or area > best[p[zi]][0]:
                best[p[zi]] = (area, p[ci])
    votes = collections.defaultdict(collections.Counter)
    for zcta, (_, county) in best.items():
        key = ("M",) + metro_of[county] if county in metro_of else ("S", county[:2], STATES[county[:2]])
        votes[zcta[:3]][key] += 1
    return {z3: c.most_common(1)[0][0] for z3, c in votes.items()}


def series_id(kind, code):
    if kind == "N":
        return "OEUN0000000000000" + OCC + "03"
    area = ("00" + code) if kind == "M" else (code + "00000")
    return "OEU" + kind + area + "000000" + OCC + "03"


def wages(ids):
    path = os.path.join(CACHE, "bls_wages.json")
    got = json.load(open(path)) if os.path.exists(path) else {}
    todo = [s for s in ids if s not in got]
    key = os.environ.get("BLS_API_KEY", "").strip()
    url, size = (BLS_URL.replace("/v1/", "/v2/"), 50) if key else (BLS_URL, 25)
    for i in range(0, len(todo), size):
        batch = todo[i:i + size]
        body = {"seriesid": batch, "registrationkey": key} if key else {"seriesid": batch}
        req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json"})
        res = json.load(urllib.request.urlopen(req, timeout=60))
        if res.get("status") != "REQUEST_SUCCEEDED":
            print("BLS stopped answering:", res.get("message"), file=sys.stderr)
            break
        seen = {}
        for s in res["Results"]["series"]:
            d = s.get("data") or []
            try:
                seen[s["seriesID"]] = {"value": float(d[0]["value"]), "year": d[0]["year"]} if d else None
            except ValueError:
                seen[s["seriesID"]] = None  # suppressed figure
        for sid in batch:
            got[sid] = seen.get(sid)
        json.dump(got, open(path, "w"))
        time.sleep(1.5)
    return got


def main():
    metro_of = county_to_metro()
    areas = zip3_areas(metro_of)
    ids = {series_id("N", "")}
    for a in areas.values():
        ids.add(series_id(a[0], a[1]))
    ids |= {series_id("S", f) for f in STATES}  # state figures back up metros with no data
    got = wages(sorted(ids))
    missing = [s for s in ids if s not in got]
    nat = got.get(series_id("N", ""))
    if not nat:
        sys.exit("No wage data yet: the BLS daily cap was reached. Set BLS_API_KEY or run again tomorrow.")
    table, used = {}, collections.Counter()
    for z3, a in sorted(areas.items()):
        w = got.get(series_id(a[0], a[1]))
        label = a[2] if a[0] == "M" else a[2] + " statewide"
        if not w and a[0] == "M":  # metro figure missing or suppressed: use its first state
            st = a[2].split(", ")[-1].split("-")[0]
            fips = next((f for f, ab in STATES.items() if ab == st), None)
            w, label = got.get(series_id("S", fips)) if fips else None, st + " statewide"
            used["metro->state"] += 1
        if not w:
            used["no data"] += 1
            continue
        used[a[0]] += 1
        table[z3] = [round(w["value"] / nat["value"], 2), label]
    data = {"year": nat["year"], "national": nat["value"],
            "source": "BLS Occupational Employment and Wage Statistics, construction and extraction occupations, mean hourly wage; Census 2020 ZIP areas and 2023 metro areas",
            "zip3": table}
    with open(OUT, "w") as f:
        f.write("/* Generated by scripts/build_labor_index.py. Do not edit by hand. */\n")
        f.write("(function (root) { root.RF = Object.assign(root.RF || {}, { LABOR: " + json.dumps(data, separators=(",", ":")) + " }); })(typeof globalThis !== 'undefined' ? globalThis : this);\n")
    print("zip prefixes:", len(table), dict(used), "series still missing:", len(missing))


if __name__ == "__main__":
    main()
