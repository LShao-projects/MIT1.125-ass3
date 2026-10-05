#!/usr/bin/env python3
"""Build the EU dashboard seed from the frozen 2026-10-03 source audit.

The audit JSON is intentionally kept outside the website. Re-running this script
requires that exact local snapshot; it never fetches or silently revises data.
"""

import json
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT.parent / "research" / "eu-coverage-snapshot-2026-10-03.json"
OUTPUT = ROOT / "data" / "seed.json"
RETRIEVAL_AUDIT_PATH = ROOT / "data" / "source-retrieval-audit.json"
RETRIEVAL_AUDIT = json.loads(RETRIEVAL_AUDIT_PATH.read_text()) if RETRIEVAL_AUDIT_PATH.exists() else {}

NAMES = {
    "AT": "Austria", "BE": "Belgium", "BG": "Bulgaria", "HR": "Croatia",
    "CY": "Cyprus", "CZ": "Czechia", "DK": "Denmark", "EE": "Estonia",
    "FI": "Finland", "FR": "France", "DE": "Germany", "EL": "Greece",
    "HU": "Hungary", "IE": "Ireland", "IT": "Italy", "LV": "Latvia",
    "LT": "Lithuania", "LU": "Luxembourg", "MT": "Malta", "NL": "Netherlands",
    "PL": "Poland", "PT": "Portugal", "RO": "Romania", "SK": "Slovakia",
    "SI": "Slovenia", "ES": "Spain", "SE": "Sweden",
}

SOURCE_URLS = {
    "S-EUROSTAT": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2",
    "S-EMBER": "https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_yearly_global.csv",
    "S-EPOCH-DC": "https://epoch.ai/data/data_centers/data_centers.csv",
    "S-EPOCH-GPU": "https://epoch.ai/data/gpu_clusters.csv",
    "S-DE-01": "https://www.bundesnetzagentur.de/1043444",
    "S-FR-01": "https://analysesetdonnees.rte-france.com/en/annual-review-2024/keyfindings",
    "S-SE-01": "https://www.energimyndigheten.se/nyhetsarkiv/2025/slutgiltig-statistik-for-el-och-fjarrvarme-2024/",
}


def number(row, field):
    value = row.get(field)
    if value in (None, ""):
        raise ValueError(f"Missing {field} for {row.get('Area')}")
    return float(value)


def source(id_, title, publisher, period, type_, notes):
    return {
        "id": id_, "title": title, "publisher": publisher,
        "url": SOURCE_URLS[id_], "period": period, "type": type_,
        "verificationStatus": "pending", "notes": notes,
        **({"retrievedAt": RETRIEVAL_AUDIT[id_]["retrievedAt"].replace("+00:00", "Z")}
           if id_ in RETRIEVAL_AUDIT else {}),
    }


def make_sources(audit):
    return [
        source("S-EUROSTAT", "Electricity prices for non-household consumers (nrg_pc_205)",
               "Eurostat", "2025-S2", "statistics",
               "IG band (>=150,000 MWh/year), EUR/kWh, X_VAT. Source updated "
               + audit["eurostat_response"]["updated"] + ". National mean, not a site quote. Austria is estimated; zero and confidential observations are excluded from cost calculations."),
        source("S-EMBER", "Yearly electricity data, EU country records", "Ember", "2024", "dataset",
               "Generation, demand, generation mix and total-generation emissions intensity are from the 2024 country rows. Reported figures may include modeled values."),
        source("S-EPOCH-DC", "AI data centers database", "Epoch AI", "Snapshot downloaded by 2026-10-03", "dataset",
               "Country matches count database records, not all national data centers. Project status and current power must be read separately; projects in construction are included."),
        source("S-EPOCH-GPU", "GPU clusters database", "Epoch AI", "Snapshot downloaded by 2026-10-03", "dataset",
               "Historical phases and repeated facilities may occur. Record counts are not unique operating facilities or national capacity."),
        source("S-DE-01", "Electricity market in 2024", "Bundesnetzagentur", "2024", "official report",
               "Official German context reviewed as a source candidate; team author/date verification remains pending."),
        source("S-FR-01", "Annual electricity review 2024: key findings", "RTE", "2024", "official report",
               "Official French context reviewed as a source candidate; RTE and Ember emissions boundaries should not be mixed. Team verification remains pending."),
        source("S-SE-01", "Final statistics for electricity and district heating 2024", "Swedish Energy Agency", "2024", "official report",
               "Official Swedish survey and energy context reviewed as a source candidate; team verification remains pending."),
    ]


def make_countries(audit):
    by_iso = defaultdict(dict)
    for row in audit["ember_eu_2024"]:
        by_iso[row["ISO 3 code"]][row["Electricity source"]] = row
    result = []
    for item in audit["coverage"]:
        code, iso3 = item["geo"], item["iso3"]
        rows = by_iso[iso3]
        needed = ("Total generation", "Demand", "Renewables", "Nuclear", "Fossil")
        if not all(key in rows for key in needed):
            raise ValueError(f"Incomplete Ember energy mix for {iso3}")
        raw_price = item["electricity_price"]
        raw_status = item["price_status"]
        if raw_status == "\u6709\u503c\uff08\u4f30\u8ba1\uff09":  # Legacy source status: estimated value
            status = "estimated"
        elif raw_status == "\u6709\u503c":  # Legacy source status: available value
            status = "available"
        elif raw_status == "\u4fdd\u5bc6":  # Legacy source status: confidential
            status = "confidential"
        elif raw_status == "\u7f3a\u5931":  # Legacy source status: missing
            status = "missing"
        elif raw_status == "\u96f6\u503c\u5f85\u6838\u67e5":  # Legacy source status: zero awaiting review
            status = "review"
        else:
            raise ValueError(f"Unmapped price status: {raw_status}")
        price = raw_price if status in ("available", "estimated") and raw_price and raw_price > 0 else None
        mix = {
            "nuclear": round(number(rows["Nuclear"], "Share of generation (%)"), 3),
            "renewables": round(number(rows["Renewables"], "Share of generation (%)"), 3),
            "fossil": round(number(rows["Fossil"], "Share of generation (%)"), 3),
        }
        if abs(sum(mix.values()) - 100) > 0.02:
            raise ValueError(f"Generation mix does not sum to 100% for {code}: {mix}")
        result.append({
            "code": code, "iso3": iso3, "name": NAMES[code],
            "price": price, "priceStatus": status, "pricePeriod": "2025-S2",
            "energyYear": 2024,
            "generationTwh": round(number(rows["Total generation"], "Generation (TWh)"), 3),
            "demandTwh": round(number(rows["Demand"], "Generation (TWh)"), 3),
            "renewableShare": mix["renewables"],
            "carbonIntensity": round(number(rows["Total generation"], "Emissions intensity (gCO2e/kWh)"), 3),
            "mix": mix,
            "dcRecords": item["dc_records"], "clusterRecords": item["cluster_records"],
            "priority": code in ("DE", "FR", "SE"),
        })
    return result


def make_cases(audit):
    country_code = {name: code for code, name in NAMES.items()}
    cases = []
    for i, row in enumerate(audit["epoch_eu_data_centers"], 1):
        cases.append({
            "id": f"DC-{i:02d}", "countryCode": country_code[row["Country"]],
            "name": row["Name"], "type": "data_center",
            "operator": row["Owner"].split(" #")[0] or None,
            "status": "planned_or_building" if float(row["Current power (MW)"]) == 0 else "reported_current",
            "powerMw": float(row["Current power (MW)"]),
            "firstOperationalDate": None,
            "sourceId": "S-EPOCH-DC",
            "notes": "Epoch database record; project stage and power definition require direct operator confirmation. Zero current power is not operational capacity." if float(row["Current power (MW)"]) == 0 else "Epoch database record; current power and operating stage require direct operator confirmation.",
        })
    chosen = {
        "Germany": "Jupiter, Jülich",
        "France": "Jean Zay Supercomputer Phase 4",
        "Sweden": "NSC Berzelius Phase 2",
    }
    for i, (country, target) in enumerate(chosen.items(), 1):
        row = next(r for r in audit["epoch_eu_gpu_clusters"] if r["Country"] == country and target in r["Name"])
        cases.append({
            "id": f"GPU-{i:02d}", "countryCode": country_code[country],
            "name": row["Name"].strip('"'), "type": "gpu_cluster",
            "operator": row["Owner"] or None,
            "status": row["Status"].lower(),
            "certainty": row["Certainty"].lower(),
            "powerMw": round(float(row["Power Capacity (MW)"]), 4) if row["Power Capacity (MW)"] else None,
            "firstOperationalDate": row["First Operational Date"] or None,
            "sourceId": "S-EPOCH-GPU",
            "notes": "Epoch cluster record. Historical phases may share a facility; stated power and dates require independent confirmation.",
        })
    return cases


def main():
    audit = json.loads(SNAPSHOT.read_text())
    countries = make_countries(audit)
    if len(countries) != 27 or len({c["code"] for c in countries}) != 27:
        raise ValueError("Expected 27 distinct EU countries")
    if sum(c["price"] is not None for c in countries) != 17:
        raise ValueError("Expected 17 usable positive prices")
    generated_sources = make_sources(audit)
    # Later source research is curated in seed.json. Regenerating the original
    # country snapshot must not drop those additional records.
    if OUTPUT.exists():
        existing = json.loads(OUTPUT.read_text()).get("sources", [])
        generated_ids = {source["id"] for source in generated_sources}
        generated_sources.extend(source for source in existing if source["id"] not in generated_ids)
    payload = {
        "countries": countries,
        "sources": generated_sources,
        "cases": make_cases(audit),
    }
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {OUTPUT}: {len(countries)} countries, {len(payload['sources'])} sources, {len(payload['cases'])} cases")


if __name__ == "__main__":
    main()
