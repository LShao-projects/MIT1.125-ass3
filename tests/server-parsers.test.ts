import { test } from "node:test";
import { strict as assert } from "node:assert";
import { parseEurostatPrices, parseEmberMetric } from "../lib/server/parsers.ts";
import { isEditorId } from "../lib/server/authz.ts";

test("editor allowlist uses exact IDs", () => {
  assert.equal(isEditorId("user-1", " user-1, user-2 "), true);
  assert.equal(isEditorId("user", "user-1"), false);
  assert.equal(isEditorId("local_seedy", "local_seedy", false), false);
  assert.equal(isEditorId("local_seedy", "local_seedy", true), true);
});
const dim = (code: string) => ({ category: { index: { [code]: 0 } } });
test("Eurostat parser validates dimensions and keeps unavailable countries", () => {
  const sample = { id: ["time", "geo", "nrg_cons", "currency", "unit", "tax"], size: [1, 4, 1, 1, 1, 1], dimension: { time: dim("2025-S2"), geo: { category: { index: { DE: 0, FR: 1, NL: 2, BE: 3 } } }, nrg_cons: dim("MWH_GE150000"), currency: dim("EUR"), unit: dim("KWH"), tax: dim("X_VAT") }, value: { "0": 0.15, "1": 0.12, "2": 0, "3": 0.2 }, status: { "1": "e", "3": "c" } };
  assert.deepEqual([...parseEurostatPrices(sample)], [["DE", { price: 0.15, status: "available" }], ["FR", { price: 0.12, status: "estimated" }], ["NL", { price: null, status: "unavailable" }], ["BE", { price: null, status: "confidential" }]]);
  assert.throws(() => parseEurostatPrices({ ...sample, dimension: { ...sample.dimension, unit: dim("MWH") } }));
});
test("Ember parser validates entity and year", () => {
  const data = { data: [{ entity_code: "DEU", date: "2024", is_aggregate_entity: false, series: "Total", generation_twh: 100 }] };
  assert.equal(parseEmberMetric(data, "generation_twh", 2024, "DEU"), 100);
  assert.throws(() => parseEmberMetric(data, "generation_twh", 2024, "FRA"));
  assert.throws(() => parseEmberMetric({ data: [{ ...data.data[0], date: "2023" }] }, "generation_twh", 2024, "DEU"));
});

test("grounded answers require current D1 source IDs, except explicit evidence gaps", async () => {
  const { validGroundedAnswer } = await import("../lib/server/evidence.ts");
  const allowed = new Set(["S-EMBER", "S-CALC"]);
  assert.equal(validGroundedAnswer({ answer: "Generation is 100 TWh.", citations: ["S-EMBER"] }, allowed), true);
  assert.equal(validGroundedAnswer({ answer: "Generation is 100 TWh.", citations: ["S-FR-01"] }, allowed), false);
  assert.equal(validGroundedAnswer({ answer: "Generation is 100 TWh.", citations: [] }, allowed), false);
  assert.equal(validGroundedAnswer({ answer: "Evidence is insufficient to answer.", citations: [] }, allowed), true);
});
