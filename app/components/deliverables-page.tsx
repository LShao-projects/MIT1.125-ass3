'use client';
import {useEffect,useState} from 'react';

type Id='architecture'|'schema'|'sources'|'design'|'requirements'|'tests';
const requirements=[
['FR1','Present the proposed location and initial design','Overview and Initial Design'],['FR2','Compare at least three countries','France, Germany and Sweden'],['FR3','Persist evidence and assumptions','Cloudflare D1 and versioned migrations'],['FR4','Retrieve an external dataset','Eurostat and Ember server integrations'],['FR5','Let registered users ask the adviser','Authenticated AI Adviser'],['FR6','Block unregistered AI access','Server-side identity and registration checks'],['FR7','Cite substantive AI answers','Validated D1 source IDs and links'],['FR8','Separate facts, estimates and unknowns','Claim classifications and structured answers'],['FR9','Keep the last valid external data','Per-metric validation and failure retention'],['FR10','Show when data was updated','Periods and retrieval dates in the interface']];
const tests=[['T01–T04','Public access, AI protection and registration','Pass'],['T05–T06','Saved PUE readback and synchronization','Pass'],['T07','Missing facts are identified','Pass'],['T08–T09','External refresh and failure retention','Pass'],['T10','Unauthorized writes are rejected','Pass'],['T11–T12','Real citations and certification refusal','Pass'],['T13','Retrieved-source prompt injection fixture','Pass'],['T14','Each member explains one complete request flow','Partial'],['T15','Full hosted retest and migration evidence','Partial']];
const schemaSql=`-- Cloudflare D1 schema (SQLite)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  team TEXT,
  course_section TEXT,
  rules_accepted_at TEXT,
  rules_version TEXT,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE countries (
  code TEXT PRIMARY KEY,
  iso3 TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL,
  price_status TEXT NOT NULL,
  price_period TEXT,
  energy_year INTEGER,
  generation_twh REAL,
  demand_twh REAL,
  energy_metrics TEXT,
  renewable_share REAL,
  carbon_intensity REAL,
  mix TEXT,
  dc_records INTEGER NOT NULL DEFAULT 0,
  cluster_records INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT,
  price_retrieved_at TEXT,
  energy_retrieved_at TEXT
);

CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  period TEXT,
  type TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  retrieved_at TEXT
);

CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL
);

CREATE TABLE designs (
  id TEXT PRIMARY KEY,
  inputs TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE proposal_versions (
  id TEXT PRIMARY KEY,
  inputs TEXT NOT NULL,
  requirements TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);

CREATE TABLE design_claims (
  id TEXT PRIMARY KEY,
  design_id TEXT NOT NULL,
  country_code TEXT,
  claim TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  source_id TEXT,
  period TEXT NOT NULL,
  notes TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  notes TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'current'
);

CREATE TABLE refreshes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  inputs TEXT NOT NULL,
  results TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE adviser_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  request_at TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE role_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  previous_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  changed_at TEXT NOT NULL
);`;
const items:{id:Id;number:string;title:string;description:string;format:string}[]=[
{id:'architecture',number:'01',title:'Architecture diagram',description:'Browser, access controls, server paths, D1 and external providers.',format:'SVG'},
{id:'schema',number:'02',title:'D1 schema',description:'The SQLite tables that persist identity, evidence, designs and audit history.',format:'SQL'},
{id:'sources',number:'03',title:'External sources and APIs',description:'Data providers, research sources, reporting periods and limitations.',format:'MD'},
{id:'design',number:'04',title:'Initial datacenter design',description:'The proposed power, cooling, network and operating concept.',format:'MD'},
{id:'requirements',number:'05',title:'Functional requirements',description:'FR1–FR10 mapped to the implemented site.',format:'MD'},
{id:'tests',number:'06',title:'Test results',description:'Automated checks and assignment acceptance results.',format:'MD'}];
const downloads:Record<Id,{href:string;label:string}>={architecture:{href:'/deliverables/software-architecture.svg',label:'Download diagram'},schema:{href:'/deliverables/d1-schema.sql',label:'Download SQL'},sources:{href:'/deliverables/sources-and-apis.md',label:'Download source list'},design:{href:'/deliverables/initial-design.md',label:'Download design report'},requirements:{href:'/deliverables/functional-requirements.md',label:'Download requirements'},tests:{href:'/deliverables/test-results.md',label:'Download test report'}};

function Content({id,sourceCount}:{id:Id;sourceCount:number}){
 if(id==='architecture')return <><p className="deliverable-intro">The earlier page showed a compressed overview. This diagram exposes the full application boundary: six browser views, server-side authorization, four request paths, shared calculations, persistence, AI and external data.</p><div className="architecture-preview"><img src="/deliverables/software-architecture.svg" alt="Full system architecture for the University AI Datacenter Planner"/></div></>;
 if(id==='schema')return <><p className="deliverable-intro">This is the D1 data model expressed as SQLite SQL. Each card is one persistent table; JSON-shaped records are stored in TEXT columns and interpreted by the application.</p><div className="schema-table-list">{schemaSql.split(/\n\n(?=CREATE TABLE)/).map((statement,index)=>{const table=statement.match(/CREATE TABLE ([a-z_]+)/)?.[1]??'schema';return <article className="schema-table-card" key={table}><header><span>{String(index+1).padStart(2,'0')}</span><h3>{table}</h3></header><pre><code>{statement}</code></pre></article>})}</div></>;
 if(id==='sources')return <><p className="deliverable-intro">The project uses {sourceCount} curated external source records and three server-side APIs. National figures support comparison; they do not replace site quotations, grid studies or engineering surveys.</p><div className="table-scroll"><table><thead><tr><th>Provider</th><th>Used for</th><th>Scope</th></tr></thead><tbody><tr><th><a href="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2" target="_blank" rel="noreferrer">Eurostat ↗</a></th><td>Large non-household electricity-price references</td><td>2025-S2 · national statistic</td></tr><tr><th><a href="https://api.ember-energy.org/" target="_blank" rel="noreferrer">Ember ↗</a></th><td>Demand, generation mix and carbon intensity</td><td>Annual national data</td></tr><tr><th><a href="https://platform.openai.com/docs/api-reference/responses" target="_blank" rel="noreferrer">OpenAI Responses API ↗</a></th><td>Grounded adviser answers and evidence research</td><td>Server-only key and validated citations</td></tr></tbody></table></div><p className="modal-note">The downloadable register lists every source, period, use and limitation. The <a href="/evidence">Evidence page</a> shows the claims and human checks.</p></>;
 if(id==='design')return <div className="design-report"><section><h3>Purpose and baseline</h3><p>The proposal is an initial concept for a shared university AI datacenter in France, using Paris-Saclay as the screening location. The baseline assumes 20 MW of IT load, PUE 1.25, 25 MW total facility load and 219 GWh of annual electricity at continuous full load.</p></section><section><h3>Power system</h3><p>Grid supply enters independent A and B distribution paths, each serving UPS-backed IT loads. Backup generators support critical IT, cooling controls and network equipment after utility loss. The largest distribution component may fail while the remaining path carries protected load; non-critical training jobs may be shed.</p></section><section><h3>Cooling and heat</h3><p>The concept uses direct-to-chip liquid cooling with an indoor water loop and outdoor dry heat rejection. This reduces routine water dependence and creates a possible heat-reuse interface. Final temperatures, redundancy, water treatment and seasonal performance require vendor curves and site studies.</p></section><section><h3>Network and operations</h3><p>Two physically diverse carriers connect to separate building entrances. A high-speed cluster fabric links compute and storage, with a separate management path and an external backup copy. Capacity is allocated through member commitments, with a shared pool for unused reservations.</p></section><section><h3>Decision boundary</h3><p>The current recommendation is to lease compute while the consortium verifies demand, grid connection, site control and supplier bids. Construction should proceed only after members sign capacity commitments and site-specific technical unknowns are resolved.</p></section></div>;
 if(id==='requirements')return <><p className="deliverable-intro">Each functional requirement has an implemented location in the published site.</p><div className="table-scroll"><table><thead><tr><th>ID</th><th>Requirement</th><th>Implementation</th><th>Status</th></tr></thead><tbody>{requirements.map(([rid,requirement,implementation])=><tr key={rid}><th>{rid}</th><td>{requirement}</td><td>{implementation}</td><td><span className="deliverable-status complete">Complete</span></td></tr>)}</tbody></table></div></>;
 return <><p className="deliverable-intro"><b>Automated verification:</b> 72 tests passed, with type checking and the production build also passing. Assignment checks T01–T13 pass in their stated scopes; T14 and T15 remain partial and are labelled plainly.</p><div className="table-scroll"><table><thead><tr><th>Check</th><th>Coverage</th><th>Status</th></tr></thead><tbody>{tests.map(([tid,coverage,status])=><tr key={tid}><th>{tid}</th><td>{coverage}</td><td><span className={`deliverable-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div><p className="modal-note">Pass records the observed case. Partial means that part of the assignment check still requires team or hosted evidence.</p></>;
}

export default function DeliverablesPage({sourceCount}:{sourceCount:number}){
 const [open,setOpen]=useState<Id|null>(null);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 const active=open?items.find(item=>item.id===open):null;
 return <div className="deliverables-page"><span className="eyebrow">06 · Submission materials</span><h1>Project documents</h1><p className="minimal-lead">Architecture, data model, evidence and verification for the University AI Datacenter Planner.</p><section className="deliverable-grid" aria-label="Project documents">{items.map(item=><button key={item.id} className="deliverable-card" type="button" onClick={()=>setOpen(item.id)} aria-haspopup="dialog"><span className="deliverable-number">{item.number}</span><span className="deliverable-format">{item.format}</span><h2>{item.title}</h2><p>{item.description}</p><span className="deliverable-open">View material <span aria-hidden="true">↗</span></span></button>)}</section>{open&&active&&<div className="deliverable-modal-backdrop" onMouseDown={()=>setOpen(null)}><section className="deliverable-modal" role="dialog" aria-modal="true" aria-labelledby="deliverable-modal-title" onMouseDown={event=>event.stopPropagation()}><header className="deliverable-modal-header"><div><span className="eyebrow">{active.number} · {active.format}</span><h2 id="deliverable-modal-title">{active.title}</h2></div><button className="deliverable-close" type="button" onClick={()=>setOpen(null)} aria-label="Close">×</button></header><div className="deliverable-modal-body"><Content id={open} sourceCount={sourceCount}/></div><footer className="deliverable-modal-footer"><a className="button primary" href={downloads[open].href} download>{downloads[open].label} ↓</a><button className="button secondary" type="button" onClick={()=>setOpen(null)}>Close</button></footer></section></div>}</div>;
}
