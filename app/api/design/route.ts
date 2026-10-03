import { getDb } from "@/db";
import { designs } from "@/db/schema";
import { ensureSeed } from "@/lib/server/data";
import { defaultInputs, validateInputs } from "@/lib/model";
import { jsonError, parseBody, postGuard, requireIdentity, safeFailure } from "@/lib/server/core";
import { z } from "zod";
export const dynamic = "force-dynamic";
export async function GET() {
  try { const access=await requireIdentity(true); if(access.error)return access.error; await ensureSeed(); const row = await getDb().select().from(designs).get(); return Response.json({ inputs: row?.inputs ?? defaultInputs, updatedAt: row?.updatedAt ?? null }); }
  catch { return safeFailure(); }
}
export async function PATCH(request: Request) {
  const guard = postGuard(request); if (guard) return guard;
  const access = await requireIdentity(true, true); if (access.error) return access.error;
  const body = await parseBody(request, z.object({ inputs: z.record(z.unknown()) }).strict()); if (!body) return jsonError("Invalid inputs.");
  let inputs; try { inputs = validateInputs(body.inputs); } catch { return jsonError("Model inputs are outside the allowed range."); }
  try { const updatedAt = new Date().toISOString(); await getDb().insert(designs).values({ id: "shared", inputs: inputs as unknown as Record<string, unknown>, updatedAt, updatedBy: access.user!.userId }).onConflictDoUpdate({ target: designs.id, set: { inputs: inputs as unknown as Record<string, unknown>, updatedAt, updatedBy: access.user!.userId } }); return Response.json({ inputs, updatedAt }); }
  catch { return safeFailure(); }
}
