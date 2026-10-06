import { getDb } from "@/db";
import { cases, countries, designClaims, designs, refreshes, sources, verifications } from "@/db/schema";
import claimSeed from "@/data/claims.json";
import seed from "@/data/seed.json";
import humanChecks from "@/data/curated-human-checks.json";
import { and, desc, eq, isNull } from "drizzle-orm";
import { defaultInputs } from "@/lib/model";

let seeding: Promise<void> | undefined;
export async function ensureSeed() {
  if (!seeding) seeding = (async () => {
    const db = getDb();
    for(let i=0;i<claimSeed.length;i+=5) await db.insert(designClaims).values(claimSeed.slice(i,i+5)).onConflictDoNothing();
    const s = seed as unknown as { countries: Array<typeof countries.$inferInsert>; sources: Array<typeof sources.$inferInsert>; cases: Array<Record<string, unknown>> };
    for (let i = 0; i < s.countries.length; i += 5) await db.insert(countries).values(s.countries.slice(i, i + 5)).onConflictDoNothing();
    // Repair only missing provenance in databases created before retrieval dates
    // were included in the country seed. Later API refreshes remain authoritative.
    for (const country of s.countries) {
      if (country.priceRetrievedAt) await db.update(countries).set({ priceRetrievedAt: country.priceRetrievedAt })
        .where(and(eq(countries.code, country.code), isNull(countries.priceRetrievedAt)));
      if (country.energyRetrievedAt) await db.update(countries).set({ energyRetrievedAt: country.energyRetrievedAt })
        .where(and(eq(countries.code, country.code), isNull(countries.energyRetrievedAt)));
    }
    for(let i=0;i<s.sources.length;i+=5) await db.insert(sources).values(s.sources.slice(i,i+5)).onConflictDoNothing();
    // Fill documented retrievals in existing databases without replacing later
    // refresh timestamps or human verification status.
    for (const source of s.sources) {
      if (source.retrievedAt) await db.update(sources).set({ retrievedAt: source.retrievedAt })
        .where(and(eq(sources.id, source.id), isNull(sources.retrievedAt)));
    }
    // User-confirmed claim checks imported from this project's conversation.
    // Stable IDs prevent re-insertion; later refreshes may supersede these records.
    for (const check of humanChecks.filter(c=>c.confirmed)) {
      const inserted = await db.insert(verifications).values({id:check.id,sourceId:check.sourceId,userId:"conversation-attestation-2026-10-06",userName:"Project reviewer (confirmed in conversation)",notes:check.claim+" "+check.limitation+" Recorded by the site assistant from the reviewer's explicit confirmation; not an authenticated in-app submission.",verifiedAt:"2026-10-06T00:58:59Z",status:"current"}).onConflictDoNothing().returning({id:verifications.id});
      if(inserted.length) await db.update(sources).set({verificationStatus:"verified"}).where(eq(sources.id,check.sourceId));
    }
    await db.insert(sources).values({ id: "S-CALC", title: "Scenario calculator and shared assumptions", publisher: "Project team", url: "/economics", period: "Current design version", type: "model", verificationStatus: "pending", notes: "Deterministic nine-scenario cost model. Results depend on the stored shared baseline or explicitly supplied personal inputs; they are estimates, not observed country statistics." }).onConflictDoNothing();
    for (const c of s.cases) {
      const id = String(c.id);
      await db.insert(cases).values({ id, data: c }).onConflictDoNothing();
    }
    await db.insert(designs).values({ id: "shared", inputs: defaultInputs as unknown as Record<string, unknown>, updatedAt: new Date().toISOString(), updatedBy: "seed" }).onConflictDoNothing();
  })().catch(error => { seeding = undefined; throw error; });
  await seeding;
}
export async function getData() {
  await ensureSeed();
  const db = getDb();
  const [c, s, ca, v, r, d, claims] = await Promise.all([
    db.select().from(countries), db.select().from(sources), db.select().from(cases),
    db.select().from(verifications), db.select().from(refreshes).orderBy(desc(refreshes.createdAt)), db.select().from(designs), db.select().from(designClaims),
  ]);
  return { claims, countries: c, sources: s, cases: ca.map(x => x.data), verifications: v, refreshes: r, design: d.find(x => x.id === "shared") ?? null };
}
