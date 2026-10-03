import { identity, safeFailure, serverEnv } from "@/lib/server/core";
import { getDb } from "@/db";
import { adviserUsage } from "@/db/schema";
import { eq } from "drizzle-orm";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await identity();
    const usage = user ? await getDb().select().from(adviserUsage).where(eq(adviserUsage.userId, user.userId)) : [];
    return Response.json({ user: user ? { userId: user.userId, email: user.email, displayName: user.displayName, name: user.name, team: user.team } : null,
      registered: user?.registered ?? false, role: user?.role ?? null,
      openaiConfigured: !!serverEnv.OPENAI_API_KEY, emberConfigured: !!serverEnv.EMBER_API_KEY,
      usage: { requests: usage.length, inputTokens: usage.reduce((n, x) => n + x.inputTokens, 0), outputTokens: usage.reduce((n, x) => n + x.outputTokens, 0) },
      localPreview: (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV });
  } catch { return safeFailure(); }
}
