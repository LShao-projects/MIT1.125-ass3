import { registrationComplete } from "@/lib/registration";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const serverEnv = env as Cloudflare.Env & { ADMIN_USER_IDS?: string; EDITOR_USER_IDS?: string; OPENAI_API_KEY?: string; OPENAI_MODEL?: string; EMBER_API_KEY?: string };
import { isEditorId as checkEditorId } from "./authz";
export function isEditorId(id: string) { return checkEditorId(id, serverEnv.EDITOR_USER_IDS ?? "", (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV); }
export function bootstrapRole(id:string){
 const dev=(import.meta as ImportMeta & {env:{DEV:boolean}}).env.DEV;
 return checkEditorId(id,serverEnv.ADMIN_USER_IDS??"",dev)?"admin":isEditorId(id)?"editor":"viewer";
}
export function effectiveRole(id:string,stored?:string){
 const bootstrap=bootstrapRole(id);
 if(bootstrap==="admin")return "admin" as const;
 return stored==="admin"||stored==="editor"?stored:"viewer" as const;
}
export async function identity() {
  const person = await getChatGPTUser();
  if (!person) return null;
  const db = getDb();
  const registered = await db.select().from(users).where(eq(users.id, person.userId)).get();
  const complete=registrationComplete(registered);
  return { ...person, registered: complete, name: registered?.name ?? person.displayName,
    courseSection:registered?.courseSection??null,rulesAcceptedAt:registered?.rulesAcceptedAt??null,
    team: registered?.team ?? null, role: complete ? effectiveRole(person.userId,registered?.role) : "viewer" as const };

}
export async function requireIdentity(registered = false, editor = false) {
  const user = await identity();
  if (!user) return { error: jsonError("Sign in with ChatGPT to continue.", 401) };
  if (registered && !user.registered) return { error: jsonError("Register to continue.", 403) };
  if (editor && user.role !== "editor" && user.role !== "admin") return { error: jsonError("Editor access required.", 403) };
  return { user };
}
export function jsonError(message: string, status = 400) { return Response.json({ error: message }, { status }); }
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const target = new URL(request.url);
  return !!origin && origin === target.origin;
}
export async function parseBody<T extends z.ZodTypeAny>(request: Request, schema: T): Promise<z.infer<T> | null> {
  try { const body = await request.json(); return schema.parse(body); } catch { return null; }
}
export function postGuard(request: Request) {
  return sameOrigin(request) ? null : jsonError("Cross-origin request rejected.", 403);
}
export function safeFailure() { return jsonError("The service is temporarily unavailable.", 503); }
