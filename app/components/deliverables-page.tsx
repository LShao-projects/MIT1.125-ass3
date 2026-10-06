'use client';
import {teamConclusion} from '@/lib/team-conclusion';
import {useEffect,useState} from 'react';

type Id='architecture'|'schema'|'sources'|'design'|'requirements'|'tests'|'explanation'|'memo';
const requirements=[
['FR1','Present the proposed location and initial design','Overview and Initial Design'],['FR2','Compare at least three countries','France, Germany and Sweden'],['FR3','Persist evidence and assumptions','Cloudflare D1 and versioned migrations'],['FR4','Retrieve an external dataset','Eurostat and Ember server integrations'],['FR5','Let registered users ask the adviser','Authenticated AI Adviser'],['FR6','Block unregistered AI access','Server-side identity and registration checks'],['FR7','Cite substantive AI answers','Validated D1 source IDs and links'],['FR8','Separate facts, estimates and unknowns','Claim classifications and structured answers'],['FR9','Keep the last valid external data','Per-metric validation and failure retention'],['FR10','Show when data was updated','Periods and retrieval dates in the interface']];
const tests=[['T01–T04','Public access, AI protection and registration','Pass'],['T05–T06','Saved PUE readback and synchronization','Pass'],['T07','Missing facts are identified','Pass'],['T08–T09','External refresh and failure retention','Pass'],['T10','Unauthorized writes are rejected','Pass'],['T11–T12','Real citations and certification refusal','Pass'],['T13','Retrieved-source prompt injection fixture','Pass'],['T14','Each member explains one complete request flow','Pass'],['T15','Full hosted retest and migration evidence','Pass']];
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
const queryIndexes=[
 ['idx_claims_design','design_claims(design_id)',"SELECT * FROM design_claims WHERE design_id = ?",'Retrieves the claims for the shared design used by the AI adviser.'],
 ['idx_adviser_usage_user_time','adviser_usage(user_id, request_at)',"SELECT * FROM adviser_usage WHERE user_id = ? AND request_at >= ?",'Finds recent calls for per-user rate limits. The user_id prefix also supports account usage queries.'],
 ['idx_proposal_versions_created','proposal_versions(created_at)',"SELECT * FROM proposal_versions ORDER BY created_at DESC LIMIT 1",'Reads the latest saved requirements without sorting the full version history. SQLite can scan this index backwards.'],
 ['idx_scenarios_user_created','scenarios(user_id, created_at)',"SELECT * FROM scenarios WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",'Retrieves one user’s recent saved scenarios in date order.']
];
function IndexExplanation(){return <section><h3>Step 5 · Indexes for actual queries</h3><p>Indexes help SQLite locate matching rows and read ordered records without scanning or sorting the entire table. They use storage and add write work, so we index the query patterns used by this application.</p><div className="schema-table-list">{queryIndexes.map(([name,columns,query,reason])=><article className="schema-table-card" key={name}><header><h3>{name}</h3></header><p><code>{columns}</code></p><p>{reason}</p><pre><code>{query}</code></pre></article>)}</div><p>User identity is stored directly in users.id, which is already a primary key. Country lookups use countries.code, also a primary key; this schema stores country metrics together, so it needs no separate metrics(country_id, metric_name) index. We do not duplicate these existing primary-key indexes.</p><p>The four additional indexes are declared in db/schema.ts and introduced by migration 0007_query_indexes.sql. Earlier migrations are unchanged. The downloadable SQL includes the index definitions and their purposes.</p></section>}
const items:{id:Id;number:string;title:string;description:string;format:string}[]=[
{id:'architecture',number:'01',title:'Architecture diagram',description:'Browser, access controls, server paths, D1 and external providers.',format:'SVG'},
{id:'schema',number:'02',title:'D1 schema',description:'The SQLite tables that persist identity, evidence, designs and audit history.',format:'SQL'},
{id:'sources',number:'03',title:'External sources and APIs',description:'Data providers, research sources, reporting periods and limitations.',format:'MD'},
{id:'design',number:'04',title:'Initial datacenter design',description:'The proposed power, cooling, network and operating concept.',format:'MD'},
{id:'requirements',number:'05',title:'Functional requirements',description:'FR1–FR10 mapped to the implemented site.',format:'MD'},
{id:'tests',number:'06',title:'Test results',description:'Automated checks and assignment acceptance results.',format:'MD'},
{id:'explanation',number:'07',title:'Individual explanation',description:'Trace one adviser request from the browser to D1, OpenAI and back.',format:'TEXT'},
{id:'memo',number:'08',title:'Two-page investment memo',description:'Recommendation, decision rationale and the three findings most likely to change it.',format:'PDF'}];
const downloads:Partial<Record<Id,{href:string;label:string}>>={architecture:{href:'/deliverables/software-architecture.svg',label:'Download diagram'},schema:{href:'/deliverables/d1-schema.sql',label:'Download SQL'},sources:{href:'/deliverables/sources-and-apis.md',label:'Download source list'},design:{href:'/deliverables/initial-design.md',label:'Download design report'},requirements:{href:'/deliverables/functional-requirements.md',label:'Download requirements'},tests:{href:'/deliverables/test-results.md',label:'Download test report'},memo:{href:'/deliverables/investment-memo.pdf',label:'Download two-page memo'}};

function Content({id,sourceCount}:{id:Id;sourceCount:number}){
 if(id==='explanation')return <><p className="deliverable-intro">This example traces one concrete adviser request through the application.</p><ol className="request-flow"><li><b>Browser</b><span>Sends the question and page context without API credentials.</span></li><li><b>Access checks</b><span>The server verifies identity, registration and the request limit.</span></li><li><b>D1 and tools</b><span>The shared design is retrieved through an allowlisted tool.</span></li><li><b>OpenAI</b><span>The model explains evidence, assumptions and uncertainty.</span></li><li><b>Validation</b><span>The server checks the response structure and source IDs.</span></li><li><b>Browser response</b><span>The grounded answer returns with real citation links.</span></li></ol><div className="individual-explanation"><h3>Mingjiao Diao explanation: “What is the current PUE?”</h3><p>When a registered user asks, “What is the current PUE?”, the browser sends the question and relevant page context to the <code>/api/adviser</code> endpoint. The browser does not receive the OpenAI API key or direct database access.</p><p>The Sites backend checks the request origin, the user’s ChatGPT identity, application registration, and rate limit. It then reads the current shared design from Cloudflare D1.</p><p>The OpenAI adviser uses the controlled <code>get_design</code> tool to request the relevant design record. The backend executes that tool and returns the stored PUE of 1.25 to the model. The model then produces a structured answer that separates evidence, assumptions, and uncertainty.</p><p>Before returning the answer, the backend validates the response format and confirms that every citation identifier corresponds to a real D1 source record. Finally, the browser displays the answer and its citation, such as <code>S-CALC</code>.</p><p>This means the browser does not control the database or the model instructions. The Sites backend controls access, retrieves the evidence, validates the citations, and returns the grounded answer.</p></div><div className="individual-explanation"><h3>Liuyixin Shao Explanation:</h3><p>When a user enters a question in the <strong>Ask the Advisor</strong> section and clicks Send, the website sends the question together with relevant context, such as the current page, selected countries, design settings, and recent conversation history, to the backend endpoint <code>/api/adviser</code>.</p><p>The backend first checks the request format, user identity, registration status, and rate limit. It then uses Drizzle to read project data from the D1 database using predefined queries. Drizzle converts the backend’s TypeScript queries into SQL, D1 executes the SQL, and the matching records are returned to the backend. Next, the backend sends the user’s question, context, response instructions, and available tool descriptions to OpenAI. The model selects the tools it needs for the question. The backend runs those tools using the data already loaded from D1, together with any required calculations or approved external API requests. It collects the tool results and sends them to OpenAI in a second API call.</p><p>The model uses those results to generate an answer. The backend validates the response structure and checks that cited source IDs belong to the permitted sources, then returns the answer and citations to the browser as JSON. The frontend displays the result in the chat interface.</p></div></>;
 if(id==='architecture')return <><p className="deliverable-intro">The earlier page showed a compressed overview. This diagram exposes the full application boundary: six browser views, server-side authorization, four request paths, shared calculations, persistence, AI and external data.</p><div className="architecture-preview"><img src="/deliverables/software-architecture.svg" alt="Full system architecture for the University AI Datacenter Planner"/></div></>;
 if(id==='schema')return <><p className="deliverable-intro">This is the D1 data model expressed as SQLite SQL. Each card is one persistent table; JSON-shaped records are stored in TEXT columns and interpreted by the application.</p><div className="schema-table-list">{schemaSql.split(/\n\n(?=CREATE TABLE)/).map((statement,index)=>{const table=statement.match(/CREATE TABLE ([a-z_]+)/)?.[1]??'schema';return <article className="schema-table-card" key={table}><header><span>{String(index+1).padStart(2,'0')}</span><h3>{table}</h3></header><pre><code>{statement}</code></pre></article>})}</div><IndexExplanation/></>;
 if(id==='sources')return <><p className="deliverable-intro">The project uses {sourceCount} curated external source records and three server-side APIs. National figures support comparison; they do not replace site quotations, grid studies or engineering surveys.</p><div className="table-scroll"><table><thead><tr><th>Provider</th><th>Used for</th><th>Scope</th></tr></thead><tbody><tr><th><a href="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2" target="_blank" rel="noreferrer">Eurostat ↗</a></th><td>Large non-household electricity-price references</td><td>2025-S2 · national statistic</td></tr><tr><th><a href="https://api.ember-energy.org/" target="_blank" rel="noreferrer">Ember ↗</a></th><td>Demand, generation mix and carbon intensity</td><td>Annual national data</td></tr><tr><th><a href="https://platform.openai.com/docs/api-reference/responses" target="_blank" rel="noreferrer">OpenAI Responses API ↗</a></th><td>Grounded adviser answers and evidence research</td><td>Server-only key and validated citations</td></tr></tbody></table></div><p className="modal-note">The downloadable register lists every source, period, use and limitation. The <a href="/evidence">Evidence page</a> shows the claims and human checks.</p></>;
 if(id==='design')return <div className="design-report"><section><h3>Committee conclusion</h3><p>{teamConclusion}</p></section><section><h3>How the comparison leads to France</h3><p>France moves forward to the site and supplier study because its saved 2025-S2 electricity-price reference is €0.0614/kWh, close to Sweden’s €0.0644 and well below Germany’s €0.1307. Sweden has the lowest saved carbon intensity, so it remains the main alternative. Paris-Saclay is a region to investigate, not a secured site. A grid offer or supplier bid could still change the ranking. <a href="/evidence">Sources: S-EUROSTAT and S-EMBER</a>.</p></section><section><h3>Fixed design scope</h3><p>The preferred construction concept is a 20 MW IT datacenter in France, with PUE 1.25, 25 MW total facility power and 219 GWh/year at continuous full load. Compare France, Sweden and Germany at this same scale. The recommendation concerns where to build; it does not resize the project. Separately, the investment committee should request signed demand, a grid offer and comparable build/lease/hybrid bids before approving construction.</p></section><section><h3>Why the power design has two paths</h3><p>The A and B paths come from the availability requirement, not from the country comparison. Maintenance or one distribution failure should not disconnect every protected service at once. UPS systems cover the transfer away from grid power, and generators carry the agreed critical load during a longer outage. Restartable training jobs can be paused first. Detailed engineering still needs to check whether the two paths share switchgear, controls, cooling or fuel systems that could fail together.</p></section><section><h3>Why liquid cooling is being studied</h3><p>Dense GPU racks put a large amount of heat into a small space, which makes direct-to-chip liquid cooling a reasonable option to test. France’s Jean Zay system shows that warm-water cooling can work at HPC scale and that recovered heat can feed a local heat network. The example establishes technical feasibility, but it does not show that a Paris-Saclay site has the same equipment, water conditions or heat customer. The proposal therefore uses liquid cooling and dry outdoor heat rejection as working assumptions and assigns no income to heat reuse. <a href="https://images.cnrs.fr/photo/20250008_0023" target="_blank" rel="noreferrer">Source: S-FR-COOL ↗</a>.</p></section><section><h3>Why the network is separated</h3><p>Multi-node training depends on frequent communication between GPUs, so the internal network needs high bandwidth and low latency. Workload tests should decide between Ethernet/RDMA and InfiniBand. Two external carriers reduce access risk only when their routes and building entrances are physically separate. Storage, management access and an external backup copy provide different recovery routes when a network fault or operator mistake occurs.</p></section><section><h3>What would change the recommendation</h3><p>France is the next country to investigate, while Sweden stays in the procurement comparison. A better Swedish total offer, an earlier grid connection or a stronger carbon priority could move Sweden ahead. Construction becomes a credible option after members reserve enough capacity and the site-specific power, cooling and network assumptions are verified.</p></section><p className="caption">The fixed project baseline is 20 MW IT, PUE 1.25 and 25 MW total facility power. Equipment ratings and site delivery remain subject to validation.</p><a href="/design">View the current initial design →</a></div>;
 if(id==='memo')return <div className="design-report investment-memo"><section><span className="eyebrow">Investment committee memo · 6 October 2026</span><h3>Recommendation</h3><p><b>Prioritize France for the next site and supplier study, but do not approve construction of the 25 MW facility yet.</b> Lease equivalent GPU computing capacity for current university workloads while the consortium verifies demand, grid delivery and comparable supplier pricing. Retain Sweden as the principal country alternative and preserve the French construction concept for reassessment.</p></section><section><h3>Decision before the committee</h3><p>The shared baseline is 20 MW of IT load at PUE 1.25, equal to 25 MW of total facility load and approximately 219 GWh of electricity per year at continuous full load. The proposed facility would support shared teaching, research and AI workloads. The decision is whether demonstrated member need, cost and delivery risk justify committing capital to this full build.</p></section><section><h3>Why this recommendation</h3><p>France has the lowest saved national electricity-price reference among France, Sweden and Germany, while its saved generation carbon intensity is substantially lower than Germany’s. Sweden remains competitive because its saved carbon intensity is lower than France’s. These national records justify a France-first procurement study; they do not prove that Paris-Saclay has an available parcel, a deliverable grid connection or an acceptable site tariff.</p><p>The financial comparison currently favors leasing GPU compute for the consortium’s near-term workloads. Building would place facility and GPU capital at risk before members have signed capacity and payment commitments. The technical concept—dual power paths, backup generation, direct liquid cooling and diverse network connections—is suitable for further design work, but its site-specific feasibility has not been established.</p></section><section><h3>Three findings most likely to change the recommendation</h3><ol><li><b>Signed member demand.</b> Binding workload, capacity and payment commitments that sustain the proposed 20 MW IT scale could justify moving from leased service toward a phased or full build. Lower or later demand would strengthen the lease recommendation.</li><li><b>A binding site and grid offer.</b> Confirmed land control, 25 MW delivery capacity, connection date, grid cost, permits, cooling constraints and water conditions could make the French construction concept executable. A materially earlier or lower-risk offer in Sweden could change the country ranking.</li><li><b>Comparable supplier bids.</b> Like-for-like build, lease and hybrid proposals covering compute performance, availability, security, network service, energy, financing and lifecycle costs could change both the procurement route and preferred location.</li></ol></section><section><h3>Conditions and next action</h3><p>Issue a bounded request for information to member institutions, the relevant grid operator and qualified compute suppliers. Return to the committee with signed demand evidence, a site-specific grid offer and normalized bids. Until those records exist, authorize only the study and interim leased capacity—not construction or GPU-fleet procurement.</p></section><p className="caption">This is an initial investment screen, not a construction-ready engineering design or professional certification. Supporting claims and source limitations are available on the Evidence page.</p></div>;
 if(id==='requirements')return <><p className="deliverable-intro">Each functional requirement has an implemented location in the published site.</p><div className="table-scroll"><table><thead><tr><th>ID</th><th>Requirement</th><th>Implementation</th><th>Status</th></tr></thead><tbody>{requirements.map(([rid,requirement,implementation])=><tr key={rid}><th>{rid}</th><td>{requirement}</td><td>{implementation}</td><td><span className="deliverable-status complete">Complete</span></td></tr>)}</tbody></table></div></>;
 return <><p className="deliverable-intro"><b>Automated verification:</b> 72 tests passed, with type checking and the production build also passing. Assignment checks T01–T15 pass in their stated scopes.</p><div className="table-scroll"><table><thead><tr><th>Check</th><th>Coverage</th><th>Status</th></tr></thead><tbody>{tests.map(([tid,coverage,status])=><tr key={tid}><th>{tid}</th><td>{coverage}</td><td><span className={`deliverable-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div><p className="modal-note">Pass records the observed case.</p></>;
}

export default function DeliverablesPage({sourceCount}:{sourceCount:number}){
 const [open,setOpen]=useState<Id|null>(null);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
 const active=open?items.find(item=>item.id===open):null;
 return <div className="deliverables-page"><span className="eyebrow">06 · Submission materials</span><h1>Project documents</h1><p className="minimal-lead">Architecture, data model, evidence and verification for the University AI Datacenter Planner.</p><section className="deliverable-grid" aria-label="Project documents">{items.map(item=><button key={item.id} className="deliverable-card" type="button" onClick={()=>setOpen(item.id)} aria-haspopup="dialog"><span className="deliverable-number">{item.number}</span><span className="deliverable-format">{item.format}</span><h2>{item.title}</h2><p>{item.description}</p><span className="deliverable-open">View material <span aria-hidden="true">↗</span></span></button>)}</section>{open&&active&&<div className="deliverable-modal-backdrop" onMouseDown={()=>setOpen(null)}><section className="deliverable-modal" role="dialog" aria-modal="true" aria-labelledby="deliverable-modal-title" onMouseDown={event=>event.stopPropagation()}><header className="deliverable-modal-header"><div><span className="eyebrow">{active.number} · {active.format}</span><h2 id="deliverable-modal-title">{active.title}</h2></div><button className="deliverable-close" type="button" onClick={()=>setOpen(null)} aria-label="Close">×</button></header><div className="deliverable-modal-body"><Content id={open} sourceCount={sourceCount}/></div><footer className="deliverable-modal-footer">{downloads[open]&&<a className="button primary" href={downloads[open]!.href} download>{downloads[open]!.label} ↓</a>}<button className="button secondary" type="button" onClick={()=>setOpen(null)}>Close</button></footer></section></div>}</div>;
}
