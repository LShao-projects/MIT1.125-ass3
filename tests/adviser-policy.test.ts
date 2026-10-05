import test from "node:test";
import assert from "node:assert/strict";
import { adviserGoal, adviserTools } from "../lib/adviser-policy";

test("adviser goal requires grounded, source-aware answers", () => {
  assert.match(adviserGoal, /Distinguish facts, assumptions, calculations, design decisions and unknowns/);
  assert.match(adviserGoal, /Never invent a value or source identifier/);
  assert.match(adviserGoal, /professional engineering certification/);
});

test("adviser exposes the required controlled tools", () => {
  const names = new Set<string>(adviserTools.map(tool => tool.name));
  for (const name of ["get_design", "get_country_metrics", "get_design_claims", "calculate_energy", "query_approved_external_source"]) assert.ok(names.has(name), `${name} is missing`);
});

test("approved external-source tool cannot accept an arbitrary URL", () => {
  const tool = adviserTools.find(item => item.name === "query_approved_external_source");
  assert.ok(tool);
  assert.deepEqual(tool.parameters.properties.source.enum, ["eurostat", "ember"]);
  assert.equal("url" in tool.parameters.properties, false);
  assert.equal(tool.parameters.additionalProperties, false);
});
