import { getDb } from "@/db";
import { sources, verifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonError, parseBody, postGuard, requireIdentity, safeFailure } from "@/lib/server/core";
import { z } from "zod";
const schema = z.object({ sourceId: z.string().min(1).max(100), notes: z.string().trim().min(3).max(2000), reviewed: z.literal(true) }).strict();
export async function POST(request: Request) {
  const guard = postGuard(request); if (guard) return guard;
  const access = await requireIdentity(true, true); if (access.error) return access.error;
  const body = await parseBody(request, schema); if (!body) return jsonError("Select a source and describe what you checked.");
  try {
    const db = getDb(); const source = await db.select().from(sources).where(eq(sources.id, body.sourceId)).get();
    if (!source) return jsonError("Source not found.", 404);
    const verification = { sourceId: body.sourceId, notes: body.notes, status: "current", userId: access.user!.userId, userName: access.user!.name, verifiedAt: new Date().toISOString() };
    await db.insert(verifications).values(verification);
    await db.update(sources).set({ verificationStatus: "verified" }).where(eq(sources.id, body.sourceId));
    return Response.json({ verification });
  } catch { return safeFailure(); }
}
