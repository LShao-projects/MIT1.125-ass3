import { getData } from "@/lib/server/data";
import { safeFailure, requireIdentity } from "@/lib/server/core";
export const dynamic = "force-dynamic";
export async function GET() { try { const data=await getData(); return Response.json({...data, verifications:data.verifications.map(({userId,...v})=>v), refreshes:data.refreshes.map(({userId,...r})=>r), design:data.design?{inputs:data.design.inputs,updatedAt:data.design.updatedAt}:null}); } catch { return safeFailure(); } }
