import {queryEmber} from "./ember";
import { env } from "cloudflare:workers";

import { parseEurostatPrices } from "./parsers";
export const EUROSTAT_PRICE_URL = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2";
export async function fetchEurostatPrices(localOrigin?: string) {
  let response: Response;
  try {
    response = await fetch(EUROSTAT_PRICE_URL, { signal: AbortSignal.timeout(18000) });
  } catch (error) {
    if (!import.meta.env.DEV || !localOrigin || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(localOrigin)) throw error;
    response = await fetch(new URL("/__dev/eurostat", localOrigin), { signal: AbortSignal.timeout(22000) });
  }
  if (!response.ok) throw new Error("Eurostat unavailable");
  return parseEurostatPrices(await response.json());
}
export async function fetchEmberCountry(iso3: string, year = 2024) {
  const key = (env as Cloudflare.Env & { EMBER_API_KEY?: string }).EMBER_API_KEY;
  if (!key) throw new Error("Ember key unavailable");
  return queryEmber(key,iso3,year);
}
