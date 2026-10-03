import { env } from "cloudflare:workers";

import { parseEurostatPrices, parseEmberMetric, type EmberMetrics } from "./parsers";
export async function fetchEurostatPrices() {
  const url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2";
  const response = await fetch(url, { signal: AbortSignal.timeout(18000) });
  if (!response.ok) throw new Error("Eurostat unavailable");
  return parseEurostatPrices(await response.json());
}
export async function fetchEmberCountry(iso3: string, year = 2024): Promise<EmberMetrics> {
  const key = (env as Cloudflare.Env & { EMBER_API_KEY?: string }).EMBER_API_KEY;
  if (!key) throw new Error("Ember key unavailable");
  const endpoints = [
    ["electricity-demand/yearly", "demand_twh"],
    ["electricity-generation/yearly", "generation_twh"],
    ["carbon-intensity/yearly", "emissions_intensity_gco2_per_kwh"],
  ] as const;
  const values = await Promise.all(endpoints.map(async ([path, field]) => {
    const url = new URL(`https://api.ember-energy.org/v1/${path}`);
    url.searchParams.set("entity_code", iso3); url.searchParams.set("start_date", String(year)); url.searchParams.set("end_date", String(year));
    url.searchParams.set("api_key", key);
    const response = await fetch(url, { signal: AbortSignal.timeout(18000) });
    if (!response.ok) throw new Error("Ember unavailable");
    return parseEmberMetric(await response.json(), field, year, iso3);
  }));
  return { demandTwh: values[0], generationTwh: values[1], carbonIntensity: values[2], energyYear: year };
}
