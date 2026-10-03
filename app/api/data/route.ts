import { getData } from "@/lib/server/data";
import { safeFailure, requireIdentity } from "@/lib/server/core";
export const dynamic = "force-dynamic";
export async function GET() { try { const access=await requireIdentity(true); if(access.error)return access.error; return Response.json(await getData()); } catch { return safeFailure(); } }
