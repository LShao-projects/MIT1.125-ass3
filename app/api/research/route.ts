import {and,eq,gte} from 'drizzle-orm';
import {getDb} from '@/db';
import {adviserUsage} from '@/db/schema';
import {jsonError,parseBody,postGuard,requireIdentity,serverEnv} from '@/lib/server/core';
import {parseResearchResponse,researchPayload,researchRequest,validateResearchSources} from '@/lib/research';
export async function POST(request:Request){
 const guard=postGuard(request);if(guard)return guard;
 const access=await requireIdentity(true);if(access.error)return access.error;
 const body=await parseBody(request,researchRequest);if(!body)return jsonError('Choose a topic and enter a question of 10–1,200 characters.');
 if(!serverEnv.OPENAI_API_KEY)return jsonError('Web research is not configured. Ask the administrator to configure the OpenAI API key.',503);
 try{
  const db=getDb(),now=new Date();
  const recent=await db.select().from(adviserUsage).where(and(eq(adviserUsage.userId,access.user!.userId),gte(adviserUsage.requestAt,new Date(now.getTime()-60_000).toISOString())));
  if(recent.length>=10)return jsonError('Too many requests. Research and adviser share 10 requests per minute. Please wait a minute and retry.',429);
  const [reservation]=await db.insert(adviserUsage).values({userId:access.user!.userId,requestAt:now.toISOString(),inputTokens:0,outputTokens:0}).returning();
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${serverEnv.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify(researchPayload(body,serverEnv.OPENAI_MODEL||'gpt-4.1-mini')),signal:AbortSignal.timeout(55000)});
  if(!response.ok)return jsonError(response.status===429?'Search provider is busy or has reached its usage limit. Try again later.':'Web search is unavailable. Check the server’s model and API configuration, then retry.',503);
  const raw=await response.json() as {usage?:{input_tokens?:number;output_tokens?:number}};
  await db.update(adviserUsage).set({inputTokens:raw.usage?.input_tokens??0,outputTokens:raw.usage?.output_tokens??0}).where(eq(adviserUsage.id,reservation.id));
  let blocks;try{blocks=parseResearchResponse(raw);if(!validateResearchSources(blocks,body.topic,body.country))throw new Error("Source outside institutional scope");}catch{return jsonError('Search did not return a complete answer with usable citations. Try a more specific question.',502);}
  return Response.json({...body,blocks,searchedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
 }catch{return jsonError('Research could not finish. Please try again; no project assumptions were changed.',503);}
}
