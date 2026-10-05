import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateModel,
  defaultInputs,
  runScenarios,
  validateInputs,
} from "../lib/model.ts";

test("20 MW and PUE 1.25 give 25 MW and 219 GWh at full load", () => {
  const result = calculateModel({ ...defaultInputs, utilization: 1 });
  assert.equal(result.capacity.gpuCount, 20_000 / defaultInputs.gpuAllocatedItKw);
  assert.equal(result.capacity.peakFacilityMw, 25);
  assert.equal(result.capacity.fullLoadGwh, 219);
  assert.equal(result.rows.length, 11);
  assert.equal(result.rows[0].gpuHours, 0);
  assert.equal(result.rows[1].energyGwh, 219);
});

test("all routes and shocks preserve equivalent productive demand", () => {
  const results = runScenarios(defaultInputs);
  assert.equal(results.length, 9);
  assert.equal(new Set(results.map((result) => `${result.route}/${result.scenario}`)).size, 9);
  for (const scenario of ["base", "delay", "half"] as const) {
    const cases = results.filter((result) => result.scenario === scenario);
    assert.equal(new Set(cases.map((result) => result.rows[1].gpuHours)).size, 1);
  }
  const base = results.find((result) => result.route === "build" && result.scenario === "base")!;
  const half = results.find((result) => result.route === "build" && result.scenario === "half")!;
  assert.equal(half.rows[1].gpuHours, base.rows[1].gpuHours / 2);
  assert.ok(half.rows[1].energyGwh > base.rows[1].energyGwh / 2);
  assert.ok(half.costPerGpuHour > base.costPerGpuHour);
});

test("grid delay moves GPU purchase, adds temporary lease, and leaves pure lease unchanged", () => {
  const results = runScenarios(defaultInputs);
  const get = (route: string, scenario: string) => results.find((x) => x.route === route && x.scenario === scenario)!;
  const build = get("build", "base");
  const delayed = get("build", "delay");
  assert.equal(build.rows[0].gpuCapex, delayed.rows[1].gpuCapex);
  assert.equal(delayed.rows[0].gpuCapex, 0);
  assert.equal(delayed.rows[1].energyGwh, 0);
  assert.ok(delayed.rows[1].opex > 0);
  assert.ok(delayed.rows[1].financing > 0);
  assert.ok(delayed.totalCost > build.totalCost);
  assert.deepEqual(get("lease", "delay").rows, get("lease", "base").rows);
  assert.equal(get("lease", "delay").totalCost, get("lease", "base").totalCost);
});

test("hybrid invests in a smaller facility and responds to lease price", () => {
  const base = runScenarios(defaultInputs);
  const build = base.find((x) => x.route === "build" && x.scenario === "base")!;
  const hybrid = base.find((x) => x.route === "hybrid" && x.scenario === "base")!;
  assert.ok(hybrid.rows[0].facilityCapex < build.rows[0].facilityCapex);
  assert.ok(hybrid.rows[0].gpuCapex < build.rows[0].gpuCapex);
  const expensive = calculateModel({ ...defaultInputs, leaseEurPerGpuHour: defaultInputs.leaseEurPerGpuHour * 2 }, "hybrid");
  assert.ok(expensive.totalCost > hybrid.totalCost);
});

test("lease minimum makes lower demand more expensive per productive hour", () => {
  const base = calculateModel(defaultInputs, "lease", "base");
  const half = calculateModel(defaultInputs, "lease", "half");
  assert.equal(half.rows[1].gpuHours, base.rows[1].gpuHours / 2);
  assert.ok(half.annualOpex[0] > base.annualOpex[0] / 2);
  assert.ok(half.costPerGpuHour > base.costPerGpuHour);
});

test("hybrid grid delay preserves the permanent lease minimum", () => {
  const inputs = { ...defaultInputs, utilization: 0.3, leaseMinimumFraction: 0.4 };
  const delayed = calculateModel(inputs, "hybrid", "delay");
  const owned = inputs.hybridBuildFraction;
  const permanentLease = delayed.capacity.gpuCount * (1 - owned) * 8760 * inputs.leaseMinimumFraction * inputs.leaseEurPerGpuHour;
  const temporaryLease = delayed.capacity.gpuCount * owned * 8760 * inputs.utilization * inputs.leaseEurPerGpuHour;
  const fixedSiteCost = delayed.capacity.ownedItMw * inputs.fixedOpexEurPerMwYear;
  assert.ok(Math.abs(delayed.rows[1].opex - (permanentLease + temporaryLease + fixedSiteCost)) < 0.001);
});

test("invalid and nonfinite inputs are rejected", () => {
  for (const change of [
    { utilization: -0.1 },
    { pue: 0.8 },
    { gpuAllocatedItKw: 0 },
    { electricityEurPerKwh: Number.NaN },
    { leaseEurPerGpuHour: Number.POSITIVE_INFINITY },
    { hybridBuildFraction: 1.1 },
  ]) {
    assert.throws(() => validateInputs({ ...defaultInputs, ...change }), RangeError);
  }
});

test("cash needed before delayed opening includes deferred equipment and the bridge year",()=>{for(const route of ["build","hybrid"] as const){const base=calculateModel(defaultInputs,route,"base"),delay=calculateModel(defaultInputs,route,"delay");assert.equal(delay.preOpeningCash,-delay.rows[0].cashFlow-delay.rows[1].cashFlow);assert.ok(delay.preOpeningCash>base.preOpeningCash)}assert.equal(calculateModel(defaultInputs,"lease","delay").preOpeningCash,0)});
