import { getDb } from "@/db";
import { cases, countries, designClaims, designs, refreshes, sources, verifications } from "@/db/schema";
import claimSeed from "@/data/claims.json";
import seed from "@/data/seed.json";
import { and, desc, eq, isNull } from "drizzle-orm";
import { defaultInputs } from "@/lib/model";

let seeding: Promise<void> | undefined;
export async function ensureSeed() {
  if (!seeding) seeding = (async () => {
    const db = getDb();
    for(let i=0;i<claimSeed.length;i+=5) await db.insert(designClaims).values(claimSeed.slice(i,i+5)).onConflictDoNothing();
    const s = seed as unknown as { countries: Array<typeof countries.$inferInsert>; sources: Array<typeof sources.$inferInsert>; cases: Array<Record<string, unknown>> };
    for (let i = 0; i < s.countries.length; i += 5) await db.insert(countries).values(s.countries.slice(i, i + 5)).onConflictDoNothing();
    for(let i=0;i<s.sources.length;i+=5) await db.insert(sources).values(s.sources.slice(i,i+5)).onConflictDoNothing();
    // Fill documented retrievals in existing databases without replacing later
    // refresh timestamps or human verification status.
    for (const source of s.sources) {
      if (source.retrievedAt) await db.update(sources).set({ retrievedAt: source.retrievedAt })
        .where(and(eq(sources.id, source.id), isNull(sources.retrievedAt)));
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
