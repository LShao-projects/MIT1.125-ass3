import {researchEvidence,composeResearchCard,evidenceReviewPayload,evidenceReviewPassed} from "@/lib/research-quality";
import {and,eq,gte} from 'drizzle-orm';
import {getDb} from '@/db';
import {adviserUsage} from '@/db/schema';
import {jsonError,parseBody,postGuard,requireIdentity,serverEnv} from '@/lib/server/core';
import {parseResearchResponse,researchPayload,researchRequest,validateResearchSources,compactResearchSections,researchFailure} from '@/lib/research';
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
  let correction="",inputTokens=0,outputTokens=0;
  for(let attempt=0;attempt<2;attempt++){
   const payload=researchPayload(body,serverEnv.OPENAI_MODEL||'gpt-4.1-mini');
   const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${serverEnv.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({...payload,instructions:payload.instructions+correction}),signal:AbortSignal.timeout(40000)});
   if(!response.ok){console.error('Research provider failed',{status:response.status,topic:body.topic});return jsonError(response.status===429?'Search provider is busy or has reached its usage limit. Try again later.':'The search provider could not complete the request. Please retry.',503);}
   const raw=await response.json() as {usage?:{input_tokens?:number;output_tokens?:number}};
   inputTokens+=raw.usage?.input_tokens??0;outputTokens+=raw.usage?.output_tokens??0;
   await db.update(adviserUsage).set({inputTokens,outputTokens}).where(eq(adviserUsage.id,reservation.id));
   try{
    const blocks=parseResearchResponse(raw,true);
    compactResearchSections(blocks);
    if(!validateResearchSources(blocks,body.topic,body.country))throw new Error("Source outside institutional scope");
    const evidence=researchEvidence(blocks);
    const reviewResponse=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${serverEnv.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify(evidenceReviewPayload(evidence,body.topic,body.country,serverEnv.OPENAI_MODEL||'gpt-4.1-mini')),signal:AbortSignal.timeout(35000)});
    if(!reviewResponse.ok){console.error('Research evidence reviewer unavailable',{status:reviewResponse.status,topic:body.topic});return jsonError('Source support could not be checked. Please retry; no research conclusion was accepted.',503);}
    const review=await reviewResponse.json() as {usage?:{input_tokens?:number;output_tokens?:number}};
    inputTokens+=review.usage?.input_tokens??0;outputTokens+=review.usage?.output_tokens??0;
    await db.update(adviserUsage).set({inputTokens,outputTokens}).where(eq(adviserUsage.id,reservation.id));
    if(!evidenceReviewPassed(review,evidence))throw new Error('Evidence support not established');
    const safeBlocks=composeResearchCard(blocks,body.topic,body.route);
    return Response.json({...body,blocks:safeBlocks,searchedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
   }catch(error){
    const failure=researchFailure(error);
    console.error('Research validation failed',{topic:body.topic,country:body.country,attempt:attempt+1,reason:failure.code});
    if(attempt===1)return jsonError(failure.message,502);
    correction=" Previous attempt failed validation. "+failure.hint;
   }
  }
  return jsonError('No validated research result was produced.',502);
 }catch(error){console.error('Research request failed',{reason:error instanceof Error&&/timeout|abort/i.test(error.name)?'timeout':'request_or_database'});return jsonError('Research could not finish. Please try again; no project assumptions were changed.',503);}
}
