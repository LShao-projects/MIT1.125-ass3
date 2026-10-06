type Index = Record<string, number> | string[];
type Eurostat = { id: string[]; size: number[]; dimension: Record<string, { category: { index: Index } }>; value: Record<string, number>; status?: Record<string, string> };
export type PriceObservation = { price: number | null; status: "available" | "estimated" | "unavailable" | "confidential" };
function entries(index: Index | undefined): Array<[string, number]> {
  if (!index) throw new Error("Missing Eurostat index");
  return Array.isArray(index) ? index.map((code, i) => [code, i]) : Object.entries(index);
}
export function parseEurostatPrices(input: unknown): Map<string, PriceObservation> {
  const data = input as Eurostat;
  if (!Array.isArray(data?.id) || !Array.isArray(data?.size) || data.id.length !== data.size.length || !data.value || !data.dimension) throw new Error("Invalid Eurostat response");
  const filters: Record<string, string> = { nrg_cons: "MWH_GE150000", currency: "EUR", unit: "KWH", tax: "X_VAT", time: "2025-S2" };
  const selected: Record<string, number> = {};
  for (const [dimension, code] of Object.entries(filters)) {
    if (!data.id.includes(dimension)) throw new Error("Eurostat filter missing");
    const found = entries(data.dimension[dimension]?.category?.index).find(([name]) => name === code);
    if (!found) throw new Error("Eurostat filter mismatch");
    selected[dimension] = found[1];
  }
  const geoAt = data.id.indexOf("geo"); if (geoAt < 0) throw new Error("Geo dimension missing");
  const geoEntries = entries(data.dimension.geo?.category?.index);
  const result = new Map<string, PriceObservation>();
  for (const [code, position] of geoEntries) {
    const coords = data.id.map(d => selected[d] ?? 0); coords[geoAt] = position;
    const offset = coords.reduce((n, value, i) => n * data.size[i] + value, 0);
    const status = data.status?.[String(offset)] ?? "";
    const price = data.value[String(offset)];
    const unavailable = !Number.isFinite(price) || price <= 0 || (status && !/^[eE]$/.test(status));
    result.set(code, { price: unavailable ? null : price,
      status: /[cux]/i.test(status) ? "confidential" : unavailable ? "unavailable" : /e/i.test(status) ? "estimated" : "available" });
  }
  if (!result.size) throw new Error("No Eurostat countries");
  return result;
}
export type EmberMetrics = { generationTwh: number; demandTwh: number; carbonIntensity: number; energyYear: number };
export function parseEmberMetric(input: unknown, field: "demand_twh" | "generation_twh" | "emissions_intensity_gco2_per_kwh", year: number, iso3: string): number {
  const rows = (input as { data?: unknown })?.data;
  if (!Array.isArray(rows)) throw new Error("Invalid Ember response");
  const matches = rows.filter(row => {
    const r = row as Record<string, unknown>;
    return r.entity_code === iso3 && /^\d{4}(?:$|-)/.test(String(r.date)) && Number(String(r.date).slice(0, 4)) === year && r.is_aggregate_entity !== true &&
      (field !== "generation_twh" || /^(total|total generation|all sources)$/i.test(String(r.series)));
  });
  if (matches.length !== 1) throw new Error("Ambiguous Ember metric");
  const value = (matches[0] as Record<string, unknown>)[field];
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error("Missing Ember metric");
  return value;
}

// Never turn an incomplete or duplicated monthly series into an annual total.
export function parseEmberMonthlyDemand(input:unknown,year:number,iso3:string):number{
 const rows=(input as {data?:unknown})?.data;
 if(!Array.isArray(rows))throw new Error('Invalid Ember monthly response');
 const months=new Map<number,number>();
 for(const row of rows){
  const r=row as Record<string,unknown>;
  if(r.entity_code!==iso3||r.is_aggregate_entity===true||!String(r.date).startsWith(String(year)+'-'))continue;
  const match=new RegExp('^'+year+'-(0[1-9]|1[0-2])(?:-01)?$').exec(String(r.date));
  if(!match||months.has(Number(match[1]))||typeof r.demand_twh!=='number'||!Number.isFinite(r.demand_twh)||r.demand_twh<0)throw new Error('Invalid or duplicate Ember month');
  months.set(Number(match[1]),r.demand_twh);
 }
 if(months.size!==12)throw new Error('Incomplete Ember year');
 return Math.round([...months.values()].reduce((sum,value)=>sum+value,0)*1e6)/1e6;
}
