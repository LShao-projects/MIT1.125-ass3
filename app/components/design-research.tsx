'use client';
import {z} from 'zod';
import {useEffect,useState,type ReactNode} from 'react';
import type {Route} from '@/lib/model';
import type {Session} from '@/lib/ui-types';
import {compactResearchSections,researchResultSchema,researchTopics,type ResearchTopic,type ResearchResult,type ResearchBlock} from '@/lib/research';

const topics:ResearchTopic[]=['ownership','grid','financing','governance'];
const routeNames={build:'Build & own',lease:'Lease compute',hybrid:'Phased hybrid'};
const countryNames={FR:'France',DE:'Germany',SE:'Sweden'};
// Per-account memory cache; no saved draft, member information or browser persistence.
const cache=new Map<string,{result:ResearchResult;expires:number}>();
const pending=new Map<string,Promise<ResearchResult>>();
async function generate(key:string,topic:ResearchTopic,route:Route,country:'FR'|'DE'|'SE'){
 const hit=cache.get(key);if(hit&&hit.expires>Date.now())return hit.result;
 const existing=pending.get(key);if(existing)return existing;
 const request=(async()=>{
  const response=await fetch('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic,route,country,question:researchTopics[topic].question}),signal:AbortSignal.timeout(165000)});
  const raw:unknown=await response.json();
  if(!response.ok){const failure=z.object({error:z.string()}).safeParse(raw);throw new Error(failure.success?failure.data.error:'Research unavailable. Please retry.');}
  const result=researchResultSchema.parse(raw);
  compactResearchSections(result.blocks);
  if(result.topic!==topic||result.route!==route||result.country!==country)throw new Error('Research context did not match this section. Please retry.');
  if(cache.size>=48)cache.delete(cache.keys().next().value!);
  cache.set(key,{result,expires:Date.now()+24*60*60_000});return result;
 })();
 pending.set(key,request);try{return await request;}finally{pending.delete(key);}
}
function CitedText({block,sources}:{block:ResearchBlock;sources:string[]}){
 const pieces:ReactNode[]=[];let cursor=0;
 const plain=(text:string)=>text.replace(/\*\*(.*?)\*\*/g,'$1').replace(/^#{1,4}\s+/gm,'');
 block.citations.forEach((c,i)=>{pieces.push(plain(block.text.slice(cursor,c.start_index)));pieces.push(<a className="research-citation" key={i} href={c.url} target="_blank" rel="noopener noreferrer" title={c.title} aria-label={`Source ${sources.indexOf(c.url)+1}: ${c.title}`}>[{sources.indexOf(c.url)+1}]</a>);cursor=c.end_index;});
 pieces.push(plain(block.text.slice(cursor)));return <span>{pieces}</span>;
}
function ResearchSection({topic,route,country,session,onAccount}:{topic:ResearchTopic;route:Route;country:'FR'|'DE'|'SE';session:Session|null;onAccount:()=>void}){
 const key=JSON.stringify(['reviewed-v8',session?.user?.userId,topic,route,country]);
 const enabled=!!(session?.registered&&session.openaiConfigured);
 const [state,setState]=useState<{key:string;result?:ResearchResult;error?:string}>({key:''});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!enabled)return;
  let disposed=false;
  // Brief debounce avoids searches for routes the user only passes through.
  const timer=setTimeout(()=>{setState({key});generate(key,topic,route,country).then(result=>{if(!disposed)setState({key,result});}).catch(error=>{if(!disposed)setState({key,error:error instanceof Error?error.message:'Research unavailable.'});});},450);
  return()=>{disposed=true;clearTimeout(timer);};
 },[key,topic,route,country,enabled,retry]);
 const current=enabled&&state.key===key?state:null,result=current?.result;
 const sources=[...new Map(result?.blocks.flatMap(b=>b.citations).map(c=>[c.url,c])??[]).values()];
 return <section className="mini-card research-section" aria-busy={enabled&&!result&&!current?.error}>
  <span className="eyebrow">AI research · web sources</span>
  <h2>{researchTopics[topic].label}</h2>
  <p className="caption">{routeNames[route]} · {countryNames[country]}{result?` · Researched ${new Date(result.searchedAt).toLocaleString()}`:''}</p>
  {!session?<p role="status">Checking research access…</p>:!session.registered?<><p>Sign in and register. The four research answers will then load automatically.</p><button onClick={onAccount}>Sign in / register</button></>:!session.openaiConfigured?<p role="status">AI research is not available yet.</p>:current?.error?<><p role="alert">{current.error}</p><button onClick={()=>setRetry(v=>v+1)}>Retry this answer</button></>:!result?<div className="research-loading" role="status"><span className="research-spinner" aria-hidden="true"/><p>Researching {researchTopics[topic].label.toLowerCase()}…<br/><small>Checking sources and whether they support the cited claims.</small></p></div>:<>
   <p className="caption">Project proposals are kept separate from AI-researched evidence. Source support is checked by AI, not human verification.</p>
   <dl className="research-compact">{compactResearchSections(result.blocks).map(({label,block})=><div key={label}><dt>{label}</dt><dd><CitedText block={block} sources={sources.map(s=>s.url)}/></dd></div>)}</dl>
   {sources.length>0&&<details className="research-sources"><summary>Sources ({sources.length})</summary><ol>{sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title||new URL(s.url).hostname}</a></li>)}</ol></details>}

  </>}
 </section>;
}
export default function DesignResearch(props:{route:Route;country:'FR'|'DE'|'SE';session:Session|null;onAccount:()=>void}){
 return <div className="design-research">{topics.map(topic=><ResearchSection key={topic} topic={topic} {...props}/>)}</div>;
}
