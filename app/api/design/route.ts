import { getDb } from "@/db";
import { designs, proposalVersions } from "@/db/schema";
import { ensureSeed } from "@/lib/server/data";
import { defaultInputs, validateInputs } from "@/lib/model";
import { jsonError, parseBody, postGuard, requireIdentity, safeFailure } from "@/lib/server/core";
import {desc,eq} from "drizzle-orm";
import {requirementSchema,emptyRequirements} from "@/lib/requirements";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await ensureSeed(); const row = await getDb().select().from(designs).where(eq(designs.id,"shared")).get(); const v=await getDb().select().from(proposalVersions).orderBy(desc(proposalVersions.createdAt)).get(); return Response.json({ requirements:v?.requirements??emptyRequirements, versionId:v?.id??null, inputs: row?.inputs ?? defaultInputs, updatedAt: row?.updatedAt ?? null }); }
  catch { return safeFailure(); }
}
export async function PATCH(request: Request) {
  const guard = postGuard(request); if (guard) return guard;
  const access = await requireIdentity(true, true); if (access.error) return access.error; if(access.user!.role!=="admin")return jsonError("Team administrator access required.",403);
  const body = await parseBody(request, z.object({ inputs: z.record(z.unknown()), requirements:requirementSchema }).strict()); if (!body) return jsonError("Invalid inputs.");
  let inputs; try { inputs = validateInputs(body.inputs); } catch { return jsonError("Model inputs are outside the allowed range."); }
  try { const updatedAt = new Date().toISOString(); await getDb().batch([getDb().insert(designs).values({ id: "shared", inputs: inputs as unknown as Record<string, unknown>, updatedAt, updatedBy: access.user!.userId }).onConflictDoUpdate({ target: designs.id, set: { inputs: inputs as unknown as Record<string, unknown>, updatedAt, updatedBy: access.user!.userId } }), getDb().insert(proposalVersions).values({id:crypto.randomUUID(),inputs:inputs as unknown as Record<string,unknown>,requirements:body.requirements,createdAt:updatedAt,createdBy:access.user!.userId})]); return Response.json({ inputs, updatedAt }); }
  catch { return safeFailure(); }
}
