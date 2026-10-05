import {getDb} from '@/db';
import {users,roleChanges} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {bootstrapRole,effectiveRole,requireIdentity,postGuard,parseBody,jsonError,safeFailure} from '@/lib/server/core';
import {registrationComplete} from '@/lib/registration';
import {z} from 'zod';
export async function GET(){
 const access=await requireIdentity(true);if(access.error)return access.error;
 if(access.user!.role!=='admin')return jsonError('Team administrator access required.',403);
 try{const rows=await getDb().select().from(users);return Response.json({users:rows.filter(registrationComplete).map(r=>({id:r.id,name:r.name,team:r.team,courseSection:r.courseSection,role:effectiveRole(r.id,r.role),locked:r.id===access.user!.userId||bootstrapRole(r.id)==='admin'}))},{headers:{'Cache-Control':'no-store'}})}catch{return safeFailure()}
}
export async function PATCH(request:Request){
 const guard=postGuard(request);if(guard)return guard;
 const access=await requireIdentity(true);if(access.error)return access.error;
 if(access.user!.role!=='admin')return jsonError('Team administrator access required.',403);
 const body=await parseBody(request,z.object({userId:z.string().min(1).max(200),role:z.enum(['viewer','editor','admin'])}).strict());if(!body)return jsonError('Select a registered member and a valid role.');
 if(body.userId===access.user!.userId||bootstrapRole(body.userId)==='admin')return jsonError('Your own role and bootstrap administrators cannot be changed here.',403);
 try{const db=getDb();const target=await db.select().from(users).where(eq(users.id,body.userId)).get();if(!target||!registrationComplete(target))return jsonError('Registered member not found.',404);
 await db.batch([db.update(users).set({role:body.role}).where(eq(users.id,target.id)),db.insert(roleChanges).values({actorId:access.user!.userId,targetId:target.id,previousRole:target.role,newRole:body.role,changedAt:new Date().toISOString()})]);return Response.json({updated:true});}catch{return safeFailure()}
}
