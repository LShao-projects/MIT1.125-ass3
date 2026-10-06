import {emberFields,mergeEmber} from "@/lib/server/ember";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { countries, refreshes } from "@/db/schema";
import { ensureSeed } from "@/lib/server/data";
import { EUROSTAT_PRICE_URL, fetchEmberCountry, fetchEurostatPrices } from "@/lib/server/refresh";
import { jsonError, parseBody, postGuard, requireIdentity, serverEnv } from "@/lib/server/core";
import { z } from "zod";
const schema = z.object({ source: z.enum(["eurostat", "ember"]) }).strict();
export async function POST(request: Request) {
  const guard = postGuard(request); if (guard) return guard;
  const access = await requireIdentity(true, true); if (access.error) return access.error;
  const body = await parseBody(request, schema); if (!body) return jsonError("Invalid source.");
  if (body.source === "ember" && !serverEnv.EMBER_API_KEY) return jsonError("Ember API key is not configured.", 503);
  let phase = "database";
  try {
    await ensureSeed(); const db = getDb(); const rows = await db.select().from(countries);
    let failedMetrics=0,liveMetrics=0,monthlyDemandFallbacks=0;
    const updates: D1PreparedStatement[] = []; const now = new Date().toISOString();
    const sourceId = body.source === "eurostat" ? "S-EUROSTAT" : "S-EMBER";
    phase = "upstream";
    if (body.source === "eurostat") {
      const prices = await fetchEurostatPrices(new URL(request.url).origin);
      if (![...prices.values()].some(x => x.price !== null)) throw new Error("No usable Eurostat prices");
      for (const row of rows) {
        const observed = prices.get(row.code) ?? { price: null, status: "unavailable" };
        updates.push(env.DB!.prepare("UPDATE countries SET price=?, price_status=?, price_period=?, price_retrieved_at=?, updated_at=? WHERE code=?").bind(observed.price, observed.status, "2025-S2", now, now, row.code));
      }
    } else {
      // Limit concurrent countries; every metric retains its own provenance.
      for(let i=0;i<rows.length;i+=3){
        const results=await Promise.all(rows.slice(i,i+3).map(async row=>({row,values:mergeEmber(row,await fetchEmberCountry(row.iso3,row.energyYear??2024))})));
        for(const {row,values} of results){
          const live=emberFields.filter(field=>values.metrics[field].status==='live').length;
          liveMetrics+=live;failedMetrics+=3-live;
          if(values.metrics.demandTwh.status==='live'&&values.metrics.demandTwh.method==='monthly_sum')monthlyDemandFallbacks++;
          updates.push(env.DB!.prepare("UPDATE countries SET generation_twh=?, demand_twh=?, carbon_intensity=?, energy_metrics=? WHERE code=?").bind(values.metrics.generationTwh.value,values.metrics.demandTwh.value,values.metrics.carbonIntensity.value,JSON.stringify(values.metrics),row.code));
        }
      }
    }
    if (!updates.length) return jsonError("No source records were returned; existing data was kept.", 502);
    const status=body.source==="ember"?(liveMetrics===0?"failed":failedMetrics?"partial":"success"):"success";
    const detail=body.source==="ember"?`${liveMetrics} energy metrics updated; ${failedMetrics} unavailable from Ember. ${monthlyDemandFallbacks} demand totals use 12 monthly observations because the yearly endpoint failed. Failed metrics retain stored values and original retrieval dates. Generation mix was not refreshed.`:`${updates.length} countries refreshed; prior human checks marked historical`;
    if(body.source!=="ember"||liveMetrics>0){
    updates.push(env.DB!.prepare("UPDATE sources SET retrieved_at=?, url=CASE WHEN ?='S-EUROSTAT' THEN ? ELSE url END, verification_status='pending' WHERE id=?").bind(now, sourceId, EUROSTAT_PRICE_URL, sourceId));
    updates.push(env.DB!.prepare("UPDATE verifications SET status='superseded' WHERE source_id=? AND status='current'").bind(sourceId));
    }
    updates.push(env.DB!.prepare("INSERT INTO refreshes (source,status,detail,user_id,created_at) VALUES (?,?,?,?,?)").bind(body.source, status, detail, access.user!.userId, now));
    phase = "database";
    await env.DB!.batch(updates);
    return Response.json({ source: body.source, status, detail, updatedAt: now });
  } catch (error) {
    console.error("Refresh failed", { source: body.source, phase,
      reason: body.source === "eurostat" && error instanceof Error ? error.message : "Upstream or database error" });
    try { await getDb().insert(refreshes).values({ source: body.source, status: "failed", detail: phase === "upstream" ? "Upstream data unavailable or invalid; prior values retained" : "Database write failed; prior values retained", userId: access.user!.userId, createdAt: new Date().toISOString() }); } catch {}
    return jsonError(phase === "upstream" ? "The external source could not be refreshed. The last valid data is still available." : "The refresh could not be saved. The last valid data is still available.", 503);
  }
}
