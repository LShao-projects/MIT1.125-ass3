"""Check newly retrieved public sources against the frozen 2026-10-03 rows.

Downloads the complete three CSVs, compares every archived in-scope row,
and records access time and hashes. Does not perform human verification.
"""
import csv
import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT.parent / "research/eu-coverage-snapshot-2026-10-03.json"
ARCHIVE = json.loads(SNAPSHOT.read_text())
SOURCES = {
    "S-EMBER": ("https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_yearly_global.csv", "ember_eu_2024", ["ISO 3 code", "Electricity source"]),
    "S-EPOCH-DC": ("https://epoch.ai/data/data_centers/data_centers.csv", "epoch_eu_data_centers", ["Name"]),
    "S-EPOCH-GPU": ("https://epoch.ai/data/gpu_clusters.csv", "epoch_eu_gpu_clusters", ["Name"]),
}
PAGES = {
    "S-DE-01": "https://www.bundesnetzagentur.de/1043444",
    "S-FR-01": "https://analysesetdonnees.rte-france.com/en/annual-review-2024/keyfindings",
    "S-SE-01": "https://www.energimyndigheten.se/nyhetsarkiv/2025/slutgiltig-statistik-for-el-och-fjarrvarme-2024/",
}


def get(url, cap=30_000_000):
    req = urllib.request.Request(url, headers={"User-Agent": "CommonGroundResearch/1.0"})
    with urllib.request.urlopen(req, timeout=35) as response:
        content = response.read(cap + 1)
        if len(content) > cap:
            raise ValueError("Source exceeds configured download limit")
        if response.status != 200 or not content:
            raise ValueError("Source unavailable")
        return content, datetime.now(timezone.utc).isoformat(timespec="seconds")


def check_rows(content, archived_rows, keys, year_filter=False):
    rows = list(csv.DictReader(StringIO(content.decode("utf-8-sig"))))
    if year_filter:
        rows = [row for row in rows if row.get("Year") == "2024"]
    current = {tuple(row.get(key) for key in keys): row for row in rows}
    for archived in archived_rows:
        key = tuple(archived.get(part) for part in keys)
        row = current.get(key)
        if row is None:
            raise ValueError(f"Archived row missing: {key}")
        if any(str(value) != str(row.get(field)) for field, value in archived.items() if field in row):
            raise ValueError(f"Archived row changed: {key}")
    return len(archived_rows)


def main():
    result = {}
    for source_id, (url, archive_key, keys) in SOURCES.items():
        content, retrieved_at = get(url)
        count = check_rows(content, ARCHIVE[archive_key], keys, source_id == "S-EMBER")
        result[source_id] = {"url": url, "retrievedAt": retrieved_at, "sha256": hashlib.sha256(content).hexdigest(), "archivedRowsMatched": count, "method": "Complete CSV downloaded; every archived field in the in-scope rows compared with current CSV"}
    for source_id, url in PAGES.items():
        content, retrieved_at = get(url, 5_000_000)
        result[source_id] = {"url": url, "retrievedAt": retrieved_at, "sha256": hashlib.sha256(content).hexdigest(), "method": "Official page downloaded successfully; link availability checked, claim-level human review pending"}
    target = ROOT / "data/source-retrieval-audit.json"
    target.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
    for source_id, item in result.items():
        print(source_id, item["retrievedAt"], item.get("archivedRowsMatched", "page"))


if __name__ == "__main__":
    main()
