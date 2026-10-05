import { getDb } from "@/db";
import { scenarios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { runScenarios, validateInputs } from "@/lib/model";
import { jsonError, parseBody, postGuard, requireIdentity, safeFailure } from "@/lib/server/core";
import {requirementSchema,emptyRequirements} from "@/lib/requirements";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET() {
  const access = await requireIdentity(true); if (access.error) return access.error;
  try { return Response.json({ scenarios: await getDb().select().from(scenarios).where(eq(scenarios.userId, access.user!.userId)).orderBy(desc(scenarios.createdAt)).limit(50) }); }
  catch { return safeFailure(); }
}
export async function POST(request: Request) {
  const guard = postGuard(request); if (guard) return guard;
  const access = await requireIdentity(true); if (access.error) return access.error;
  const body = await parseBody(request, z.object({ name: z.string().trim().min(1).max(100), requirements:requirementSchema.optional(), inputs: z.record(z.unknown()), results: z.unknown().optional() }).strict());
  if (!body) return jsonError("Invalid scenario.");
  let inputs; try { inputs = validateInputs(body.inputs); } catch { return jsonError("Model inputs are outside the allowed range."); }
  try { const results = runScenarios(inputs); const scenario = { id: crypto.randomUUID(), userId: access.user!.userId, name: body.name, inputs: inputs as unknown as Record<string, unknown>, results: { requirements:body.requirements??emptyRequirements, scenarios: results }, createdAt: new Date().toISOString() }; await getDb().insert(scenarios).values(scenario); return Response.json({ scenario }, { status: 201 }); }
  catch { return safeFailure(); }
}
