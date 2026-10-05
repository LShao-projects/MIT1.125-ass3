import {getDb} from '@/db';
import {users} from '@/db/schema';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {bootstrapRole,jsonError,parseBody,postGuard,safeFailure} from '@/lib/server/core';
import {registrationSchema,RULES_VERSION} from '@/lib/registration';
export async function POST(request:Request){
 const guard=postGuard(request);if(guard)return guard;
 const person=await getChatGPTUser();if(!person)return jsonError('Sign in with ChatGPT before registering.',401);
 const data=await parseBody(request,registrationSchema);if(!data)return jsonError('Name, course section, team and agreement to the project rules are required.');
 try{
 const now=new Date().toISOString();
 const profile={email:person.email,name:data.name,courseSection:data.courseSection,team:data.team,rulesAcceptedAt:now,rulesVersion:RULES_VERSION};
 // Re-registration can update the profile but must never reset or grant roles.
 await getDb().insert(users).values({id:person.userId,...profile,role:bootstrapRole(person.userId),createdAt:now}).onConflictDoUpdate({target:users.id,set:profile});
 return Response.json({registered:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return safeFailure()}
}
