import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { isEditorId, jsonError, parseBody, postGuard, safeFailure } from "@/lib/server/core";
import { z } from "zod";
const schema = z.object({ name: z.string().trim().min(1).max(100), team: z.string().trim().max(100).optional().default("") }).strict();
export async function POST(request: Request) {
  const guard = postGuard(request); if (guard) return guard;
  const person = await getChatGPTUser(); if (!person) return jsonError("Sign in with ChatGPT to continue.", 401);
  const data = await parseBody(request, schema); if (!data) return jsonError("Enter a valid name and team.");
  try {
    const role = isEditorId(person.userId) ? "editor" : "viewer";
    await getDb().insert(users).values({ id: person.userId, email: person.email, name: data.name, team: data.team, role, createdAt: new Date().toISOString() })
      .onConflictDoUpdate({ target: users.id, set: { email: person.email, name: data.name, team: data.team, role } });
    return Response.json({ registered: true, role });
  } catch { return safeFailure(); }
}
