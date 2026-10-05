/** Deterministic teaching model. All EUR values are constant-price estimates, not bids. */
export type Route = "build" | "lease" | "hybrid";
export type Scenario = "base" | "delay" | "half";

export interface ModelInputs {
  itMw: number;
  pue: number;
  /** Allocated total IT kW per equivalent GPU, including hosts, network, and storage. */
  gpuAllocatedItKw: number;
  utilization: number;
  /** Share of scheduled GPU hours that produces usable work; applied once. */
  productiveYield: number;
  electricityEurPerKwh: number;
  facilityCapexEurPerMw: number;
  gridConnectionEurPerMw: number;
  gpuCapexEur: number;
  gpuReplacementYear: number;
  gpuReplacementFraction: number;
  fixedOpexEurPerMwYear: number;
  gpuMaintenanceFraction: number;
  /** Fraction of allocated IT power drawn when GPUs are idle. */
  idlePowerFraction: number;
  /** Price per billed equivalent GPU-hour; lease capacity is assumed available. */
  leaseEurPerGpuHour: number;
  /** Annual minimum fraction of equivalent GPU-hours committed for a lease. */
  leaseMinimumFraction: number;
  hybridBuildFraction: number;
  /** Annual interest-only capital carrying charge; principal is not counted twice. */
  financingRate: number;
  residualFacilityFraction: number;
  residualGpuFraction: number;
}

export interface InputField {
  key: keyof ModelInputs;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  note: string;
}

export const inputFields: InputField[] = [
  { key: "itMw", label: "IT capacity", unit: "MW", min: 0.1, max: 200, step: 0.1, note: "20 MW course baseline; not proven demand." },
  { key: "pue", label: "Power usage effectiveness", unit: "ratio", min: 1, max: 2.5, step: 0.01, note: "Applied to modeled IT draw." },
  { key: "gpuAllocatedItKw", label: "Allocated IT power per GPU", unit: "kW/GPU", min: 0.1, max: 20, step: 0.1, note: "Includes GPU hosts and allocated network/storage power." },
  { key: "utilization", label: "Useful workload utilization", unit: "share", min: 0.01, max: 1, step: 0.01, note: "Same demand for every route; half scenario divides this by two." },
  { key: "productiveYield", label: "Productive yield", unit: "share", min: 0.01, max: 1, step: 0.01, note: "One deduction for maintenance and failed work." },
  { key: "electricityEurPerKwh", label: "Electricity price", unit: "EUR/kWh", min: 0, max: 2, step: 0.001, note: "Fixed reference price; not a site tariff or offer." },
  { key: "facilityCapexEurPerMw", label: "Facility construction", unit: "EUR/IT MW", min: 0, max: 100_000_000, step: 100_000, note: "Building, electrical, cooling, network, and contingency estimate; excludes GPUs and grid connection." },
  { key: "gridConnectionEurPerMw", label: "Grid connection", unit: "EUR/IT MW", min: 0, max: 50_000_000, step: 100_000, note: "Separate uncertain connection and upgrade allowance." },
  { key: "gpuCapexEur", label: "GPU-system purchase", unit: "EUR/GPU", min: 0, max: 300_000, step: 1_000, note: "Equivalent GPU with host share; not a procurement quote." },
  { key: "gpuReplacementYear", label: "GPU replacement year", unit: "year", min: 1, max: 10, step: 1, note: "A single refresh during the operating period." },
  { key: "gpuReplacementFraction", label: "Replacement cost", unit: "share of initial GPU cost", min: 0, max: 2, step: 0.05, note: "Refresh cash cost relative to initial system purchase." },
  { key: "fixedOpexEurPerMwYear", label: "Facility annual fixed cost", unit: "EUR/IT MW/year", min: 0, max: 10_000_000, step: 10_000, note: "Staff, water, insurance, maintenance, and service estimate; excludes power and GPU maintenance." },
  { key: "gpuMaintenanceFraction", label: "GPU annual maintenance", unit: "share/year", min: 0, max: 0.5, step: 0.01, note: "Applied to original GPU purchase cost." },
  { key: "idlePowerFraction", label: "Idle IT power floor", unit: "share", min: 0, max: 1, step: 0.01, note: "Prevents half-demand case from unrealistically halving electricity." },
  { key: "leaseEurPerGpuHour", label: "Leased GPU price", unit: "EUR/billed GPU-hour", min: 0, max: 100, step: 0.1, note: "Assumed equivalent hardware, region, and service; no supplier commitment." },
  { key: "leaseMinimumFraction", label: "Lease minimum commitment", unit: "share/year", min: 0, max: 1, step: 0.01, note: "Minimum billed hours; demand above it is pay-as-used." },
  { key: "hybridBuildFraction", label: "Hybrid owned capacity", unit: "share", min: 0.01, max: 0.99, step: 0.01, note: "Smaller facility and GPU fleet; lease supplies the residual workload." },
  { key: "financingRate", label: "Capital carrying charge", unit: "share/year", min: 0, max: 0.3, step: 0.005, note: "Interest-only estimate on deployed capital, excluding principal repayments." },
  { key: "residualFacilityFraction", label: "Facility recoverable value", unit: "share", min: 0, max: 1, step: 0.05, note: "Year-10 terminal value and capital-at-risk recovery estimate." },
  { key: "residualGpuFraction", label: "GPU recoverable value", unit: "share", min: 0, max: 1, step: 0.05, note: "Applied to the most recent GPU purchase at year 10." },
];

export const defaultInputs: ModelInputs = {
  itMw: 20,
  pue: 1.25,
  gpuAllocatedItKw: 2,
  utilization: 0.7,
  productiveYield: 0.9,
  electricityEurPerKwh: 0.1,
  facilityCapexEurPerMw: 8_000_000,
  gridConnectionEurPerMw: 1_000_000,
  gpuCapexEur: 30_000,
  gpuReplacementYear: 6,
  gpuReplacementFraction: 0.8,
  fixedOpexEurPerMwYear: 500_000,
  gpuMaintenanceFraction: 0.05,
  idlePowerFraction: 0.4,
  leaseEurPerGpuHour: 3,
  leaseMinimumFraction: 0.4,
  hybridBuildFraction: 0.4,
  financingRate: 0.06,
  residualFacilityFraction: 0.3,
  residualGpuFraction: 0.1,
};

export function validateInputs(input: unknown): ModelInputs {
  if (input === null || typeof input !== "object") throw new RangeError("Model inputs must be an object");
  const value = input as Record<string, unknown>;
  for (const field of inputFields) {
    const number = value[field.key];
    if (typeof number !== "number" || !Number.isFinite(number) || number < field.min || number > field.max || (field.key === "gpuReplacementYear" && !Number.isInteger(number))) {
      throw new RangeError(`${field.label} must be a finite number from ${field.min} to ${field.max}${field.key === "gpuReplacementYear" ? " (integer)" : ""}`);
    }
  }
  return Object.fromEntries(inputFields.map(({ key }) => [key, value[key]])) as unknown as ModelInputs;
}

export interface CashFlowRow {
  year: number;
  facilityCapex: number;
  gpuCapex: number;
  opex: number;
  financing: number;
  residualValue: number;
  cashFlow: number;
  gpuHours: number;
  energyGwh: number;
}

export interface ModelResult {
  route: Route;
  scenario: Scenario;
  preOpeningCash: number;
  annualOpex: number[];
  annualOpexPerGpuHour: number[];
  costPerGpuHour: number;
  capitalAtRisk: number;
  totalCost: number;
  rows: CashFlowRow[];
  capacity: {
    gpuCount: number;
    peakFacilityMw: number;
    fullLoadGwh: number;
    ownedItMw: number;
    annualDemandGpuHours: number;
    annualEnergyGwh: number[];
  };
}

const HOURS = 8760;

/** Base build case by default; choose route and scenario for a specific matrix cell. */
export function calculateModel(input: ModelInputs, route: Route = "build", scenario: Scenario = "base"): ModelResult {
  const x = validateInputs(input);
  if (!["build", "lease", "hybrid"].includes(route)) throw new RangeError("Unknown route");
  if (!["base", "delay", "half"].includes(scenario)) throw new RangeError("Unknown scenario");
  const utilization = x.utilization * (scenario === "half" ? 0.5 : 1);
  const gpuCount = x.itMw * 1000 / x.gpuAllocatedItKw;
  const ownedFraction = route === "build" ? 1 : route === "hybrid" ? x.hybridBuildFraction : 0;
  const ownedItMw = x.itMw * ownedFraction;
  const ownedGpuCount = gpuCount * ownedFraction;
  const facilityCapex = ownedItMw * (x.facilityCapexEurPerMw + x.gridConnectionEurPerMw);
  const gpuCapex = ownedGpuCount * x.gpuCapexEur;
  const yearlyDemand = gpuCount * HOURS * utilization * x.productiveYield;
  const delay = scenario === "delay" && ownedFraction > 0;
  const leaseCost = (fraction: number, temporary = false) => {
    if (fraction <= 0) return 0;
    const billedFraction = temporary ? utilization : Math.max(utilization, x.leaseMinimumFraction);
    return gpuCount * fraction * HOURS * billedFraction * x.leaseEurPerGpuHour;
  };
  const rows: CashFlowRow[] = [];
  const year0Facility = facilityCapex;
  const year0Gpu = delay ? 0 : gpuCapex;
  rows.push({ year: 0, facilityCapex: year0Facility, gpuCapex: year0Gpu, opex: 0, financing: 0, residualValue: 0, cashFlow: -(year0Facility + year0Gpu), gpuHours: 0, energyGwh: 0 });

  for (let year = 1; year <= 10; year++) {
    const temporaryLease = delay && year === 1;
    const activeOwn = !temporaryLease && ownedFraction > 0;
    const ownEnergyGwh = activeOwn ? ownedItMw * (x.idlePowerFraction + (1 - x.idlePowerFraction) * utilization) * x.pue * HOURS / 1000 : 0;
    const electricity = ownEnergyGwh * 1_000_000 * x.electricityEurPerKwh;
    const fixed = ownedItMw * x.fixedOpexEurPerMwYear;
    const maintenance = activeOwn ? gpuCapex * x.gpuMaintenanceFraction : 0;
    const permanentLeaseCost = leaseCost(1 - ownedFraction);
    const temporaryLeaseCost = temporaryLease ? leaseCost(ownedFraction, true) : 0;
    const opex = electricity + fixed + maintenance + permanentLeaseCost + temporaryLeaseCost;
    const refreshYear = x.gpuReplacementYear + (delay ? 1 : 0);
    const refreshed = refreshYear <= 10 && year > refreshYear;
    const gpuPurchase = temporaryLease ? gpuCapex : activeOwn && year === refreshYear ? gpuCapex * x.gpuReplacementFraction : 0;
    const deployedGpu = activeOwn ? gpuCapex * (refreshed ? x.gpuReplacementFraction : 1) : 0;
    const financing = (facilityCapex + deployedGpu) * x.financingRate;
    const residualGpuBasis = refreshYear <= 10 ? gpuCapex * x.gpuReplacementFraction : gpuCapex;
    const residualValue = year === 10 ? facilityCapex * x.residualFacilityFraction + residualGpuBasis * x.residualGpuFraction : 0;
    rows.push({ year, facilityCapex: 0, gpuCapex: gpuPurchase, opex, financing, residualValue, cashFlow: residualValue - opex - financing - gpuPurchase, gpuHours: yearlyDemand, energyGwh: ownEnergyGwh });
  }

  const totalCost = -rows.reduce((sum, row) => sum + row.cashFlow, 0);
  const gpuHours = rows.reduce((sum, row) => sum + row.gpuHours, 0);
  const recovery = facilityCapex * x.residualFacilityFraction + gpuCapex * (x.gpuReplacementYear + (delay ? 1 : 0) <= 10 ? x.gpuReplacementFraction : 1) * x.residualGpuFraction;
  const regularLeaseCommitment = leaseCost(1 - ownedFraction) / Math.max(utilization, x.leaseMinimumFraction) * x.leaseMinimumFraction;
  const temporaryCommitment = delay ? leaseCost(ownedFraction, true) : 0;
  const capitalAtRisk = Math.max(0, facilityCapex + gpuCapex - recovery) + regularLeaseCommitment + temporaryCommitment;
  return {
    route,
    scenario,
    // Delayed owned capacity opens at the start of year 2; fund the bridge year as well.
    preOpeningCash: -rows[0].cashFlow - (delay ? rows[1].cashFlow : 0),
    annualOpex: rows.slice(1).map((row) => row.opex),
    annualOpexPerGpuHour: rows.slice(1).map((row) => row.opex / row.gpuHours),
    costPerGpuHour: totalCost / gpuHours,
    capitalAtRisk,
    totalCost,
    rows,
    capacity: {
      gpuCount,
      peakFacilityMw: x.itMw * x.pue,
      fullLoadGwh: x.itMw * x.pue * HOURS / 1000,
      ownedItMw,
      annualDemandGpuHours: yearlyDemand,
      annualEnergyGwh: rows.slice(1).map((row) => row.energyGwh),
    },
  };
}

export function runScenarios(input: ModelInputs): ModelResult[] {
  const x = validateInputs(input);
  return (["build", "lease", "hybrid"] as const).flatMap((route) =>
    (["base", "delay", "half"] as const).map((scenario) => calculateModel(x, route, scenario)),
  );
}
