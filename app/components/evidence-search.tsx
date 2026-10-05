'use client';
import {z} from 'zod';
import {useRef,useState,type ReactNode} from 'react';
import type {Route} from '@/lib/model';
import type {Session} from '@/lib/ui-types';
import {researchResultSchema,researchTopics,type ResearchTopic,type ResearchResult,type ResearchBlock} from '@/lib/research';
function CitedText({block}:{block:ResearchBlock}){
 const pieces:ReactNode[]=[];let cursor=0;
 block.citations.forEach((c,i)=>{pieces.push(block.text.slice(cursor,c.start_index));pieces.push(<a key={i} href={c.url} target="_blank" rel="noopener noreferrer" title={c.title}>[{new URL(c.url).hostname}]</a>);cursor=c.end_index;});
 pieces.push(block.text.slice(cursor));return <div className="research-answer">{pieces}</div>;
}
export default function EvidenceSearch({topic,route,session,onAccount}:{topic:ResearchTopic;route:Route;session:Session|null;onAccount:()=>void}){
 const [open,setOpen]=useState(false),[question,setQuestion]=useState(researchTopics[topic].question),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<(ResearchResult&{owner:string})|null>(null);
 const pending=useRef(false);
 const owner=session?.user?.userId??'';
 const current=result?.route===route&&result.owner===owner&&session?.registered?result:null;
 async function search(){
  if(pending.current)return;
  pending.current=true;setBusy(true);setError('');setResult(null);
  try{const response=await fetch('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic,route,question:question.trim()}),signal:AbortSignal.timeout(65000)});const data=await response.json();if(!response.ok){const failure=z.object({error:z.string()}).safeParse(data);throw new Error(failure.success?failure.data.error:'Research unavailable.');}setResult({...researchResultSchema.parse(data),owner});}
  catch(e){setError(e instanceof Error?e.message:'Research unavailable. Please retry.');}finally{pending.current=false;setBusy(false);}
 }
 const sources=[...new Map(current?.blocks.flatMap(b=>b.citations).map(c=>[c.url,c])??[]).values()];
 return <div className="evidence-search">
  <button type="button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Hide research':'Search evidence'} →</button>
  {open&&<div className="research-panel">
   <h3>Research {researchTopics[topic].label.toLowerCase()}</h3>
   <p>Search public sources for the selected {route==='build'?'Build & own':route==='lease'?'Lease compute':'Phased hybrid'} alternative. Results include evidence, implications and remaining gaps.</p>
   <form onSubmit={e=>{e.preventDefault();void search();}}>
    <label>Research question<textarea minLength={10} maxLength={1200} required value={question} onChange={e=>setQuestion(e.target.value)} disabled={busy}/></label>
    {!session?.registered?<button type="button" onClick={onAccount}>Sign in / register to search</button>:<button type="submit" disabled={busy||!session.openaiConfigured||question.trim().length<10}>{busy?'Searching the web…':'Search the web'}</button>}
   </form>
   {session?.registered&&!session.openaiConfigured&&<p role="status">Web research is not configured yet.</p>}
   {busy&&<p role="status">Finding sources and preparing a cited answer…</p>}
   {error&&<p role="alert">{error}</p>}
   {current&&<div className="research-result"><p className="caption">Searched {new Date(current.searchedAt).toLocaleString()} · {current.route} · AI synthesis of web sources; proposed rules still require review.</p><p><b>Question:</b> {current.question}</p>{current.blocks.map((block,i)=><CitedText key={i} block={block}/>)}<h4>Cited sources</h4><ul>{sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title||new URL(s.url).hostname}</a><small> · {new URL(s.url).hostname}</small></li>)}</ul></div>}
   {!current&&result&&<p className="caption">The alternative or account has changed. Search again for the current context.</p>}
  </div>}
 </div>;
}
