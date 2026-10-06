// Opt-in, bounded live grid regression. No database writes.
import{readFileSync,writeFileSync,mkdirSync}from'node:fs';import{parseEnv}from'node:util';
import{researchPayload,researchTopics,parseResearchResponse,rejectedResearchSources,ResearchSourceScopeError,researchFailure}from'../../lib/research';
import{searchEvidence,researchClaimIssue,evidenceReviewPayload,evidenceReviewIssue,composeEvidenceCard}from'../../lib/research-quality';
const env={...parseEnv(readFileSync('.dev.vars','utf8')),...process.env};
if(env.RUN_LIVE_ACCEPTANCE!=='1')throw new Error('Explicit RUN_LIVE_ACCEPTANCE=1 required');
const model=env.OPENAI_MODEL||'gpt-4.1-mini';
async function ask(payload:unknown){const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(40000)});if(!response.ok)throw new Error('Provider HTTP '+response.status);return response.json();}
const request={topic:'grid' as const,country:'FR' as const,route:'build' as const,question:researchTopics.grid.question};
const attempts:unknown[]=[];let correction='',passed=false;
for(let attempt=0;attempt<2;attempt++){
 try{const payload=researchPayload(request,model);const blocks=parseResearchResponse(await ask({...payload,instructions:payload.instructions+correction}));const rejected=rejectedResearchSources(blocks,'grid','FR');if(rejected.length)throw new ResearchSourceScopeError(rejected);const evidence=searchEvidence(blocks);const claimIssue=researchClaimIssue(evidence,'grid');if(claimIssue)throw new Error('Review:'+claimIssue);const review=await ask(evidenceReviewPayload(evidence,'grid','FR',model));const issue=evidenceReviewIssue(review,evidence);if(issue)throw new Error('Review:'+issue);attempts.push({status:'passed',blocks:composeEvidenceCard(evidence,'grid','build')});passed=true;break;}
 catch(error){const failure=researchFailure(error);attempts.push({status:failure.code,...(error instanceof ResearchSourceScopeError?{rejectedSources:error.rejectedSources}:{})});correction=' Previous attempt failed validation. '+failure.hint;}
}
const report={runAt:new Date().toISOString(),model,passed,attempts};mkdirSync('.sites-runtime/qa',{recursive:true});writeFileSync('.sites-runtime/qa/grid-repair-live.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!passed)process.exitCode=1;
