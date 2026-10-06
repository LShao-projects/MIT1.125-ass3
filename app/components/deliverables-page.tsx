const requirements = [
  ['FR1','Location and initial design','Overview and Initial Design','Complete'],
  ['FR2','Compare at least three countries','France, Germany and Sweden','Complete'],
  ['FR3','Persist evidence and assumptions','Cloudflare D1 and versioned migrations','Complete'],
  ['FR4','Retrieve an external dataset','Eurostat and Ember server integrations','Complete'],
  ['FR5','Registered users can ask the adviser','Authenticated AI Adviser','Complete'],
  ['FR6','Block unregistered AI access','Server-side identity and registration checks','Complete'],
  ['FR7','Cite substantive AI answers','Validated D1 source IDs and links','Complete'],
  ['FR8','Separate facts, estimates and unknowns','Claim classifications and structured answers','Complete'],
  ['FR9','Retain the last valid external data','Per-metric validation and failure retention','Complete'],
  ['FR10','Show when data was updated','Periods and retrieval dates in the interface','Complete'],
];

const schema = [
  ['users','Registration, course section, team and role'],
  ['countries','Country metrics, vintages and refresh metadata'],
  ['sources','Publishers, URLs, periods and verification status'],
  ['cases','Stored country and facility examples'],
  ['designs','Current shared design inputs'],
  ['proposal_versions','Versioned design and requirement snapshots'],
  ['design_claims','Facts, assumptions, calculations, decisions and unknowns'],
  ['verifications','Human source checks'],
  ['refreshes','External-data refresh history'],
  ['scenarios','Saved user scenarios'],
  ['adviser_usage','AI request and token records'],
  ['role_changes','Administrator role-change audit'],
];

const tests = [
  ['T01–T04','Public access, AI protection and registration','Pass'],
  ['T05–T06','Saved PUE readback and synchronization','Pass'],
  ['T07','Missing facts are identified','Pass'],
  ['T08–T09','External refresh and failure retention','Pass'],
  ['T10','Unauthorized writes are rejected','Pass'],
  ['T11–T12','Real citations and certification refusal','Pass'],
  ['T13','Retrieved-source prompt injection fixture','Pass'],
  ['T14','Each member explains one complete request flow','Partial'],
  ['T15','Full hosted retest and migration evidence','Partial'],
];

export default function DeliverablesPage({sourceCount}:{sourceCount:number}){
  return <div className="deliverables-page">
    <span className="eyebrow">06 · Submission package</span>
    <h1>Engineering deliverables</h1>
    <p className="minimal-lead">The nine items requested in Step 26, collected in one place. Status reflects completed evidence, not planned work.</p>

    <section className="submission-status" aria-label="Submission status">
      <div><strong>7</strong><span>complete items</span></div>
      <div><strong>2</strong><span>items to finish</span></div>
      <p><b>Remaining:</b>&nbsp;record the two-minute demonstration and complete each team member’s individual request-flow explanation.</p>
    </section>

    <section className="deliverable-grid" aria-label="Submission items">
      <article className="deliverable-card"><span className="deliverable-number">01</span><span className="deliverable-status complete">Complete</span><h2>Published website</h2><p>The live decision model, evidence register and AI adviser.</p><a href="https://common-ground-datacenter.lynnyu.chatgpt.site" target="_blank" rel="noreferrer">Open published website ↗</a></article>
      <article className="deliverable-card"><span className="deliverable-number">02</span><span className="deliverable-status complete">Complete</span><h2>Architecture diagram</h2><p>Browser, server controls, D1 persistence and approved external providers.</p><a href="#software-architecture">View diagram</a></article>
      <article className="deliverable-card"><span className="deliverable-number">03</span><span className="deliverable-status complete">Complete</span><h2>D1 schema</h2><p>Twelve tables store identity, evidence, designs, refreshes and audit records.</p><a href="#d1-schema">Inspect schema</a></article>
      <article className="deliverable-card"><span className="deliverable-number">04</span><span className="deliverable-status complete">Complete</span><h2>External sources and APIs</h2><p>{sourceCount} source records plus Eurostat, Ember and OpenAI integrations.</p><a href="#sources-and-apis">Review integrations</a></article>
      <article className="deliverable-card"><span className="deliverable-number">05</span><span className="deliverable-status complete">Complete</span><h2>Initial datacenter design</h2><p>Power, cooling, networking, demand and failure-path assumptions.</p><a href="/design">Open Initial Design</a></article>
      <article className="deliverable-card"><span className="deliverable-number">06</span><span className="deliverable-status complete">Complete</span><h2>Functional requirements</h2><p>FR1–FR10 mapped to the implemented site and supporting evidence.</p><a href="#functional-requirements">Read the table</a></article>
      <article className="deliverable-card"><span className="deliverable-number">07</span><span className="deliverable-status complete">Complete</span><h2>Test results</h2><p>72 unit tests passed; T01–T13 pass and T14–T15 remain partial.</p><a href="#test-results">Read current results</a></article>
      <article className="deliverable-card pending-card"><span className="deliverable-number">08</span><span className="deliverable-status pending">Pending</span><h2>Two-minute demonstration</h2><p>The final video will show public access, assumptions, evidence, sign-in, cited advice and refresh behavior.</p><span className="pending-note">Video has not been recorded yet.</span></article>
      <article className="deliverable-card pending-card"><span className="deliverable-number">09</span><span className="deliverable-status partial">Partial</span><h2>Individual explanation</h2><p>The system flow is documented below. Each member still needs to explain one request in their own words.</p><a href="#request-flow">Use the request-flow guide</a></article>
    </section>

    <section id="software-architecture" className="mini-card deliverable-section">
      <span className="eyebrow">02 · Architecture diagram</span><h2>How the system fits together</h2>
      <p className="caption">All provider calls and credentials remain on the server.</p>
      <div className="submission-architecture" role="img" aria-label="React browser pages send HTTPS requests to the Sites application server, which connects to Cloudflare D1, OpenAI, Eurostat and Ember">
        <div className="architecture-layer"><small>01 / Browser</small><strong>React interface</strong><span>Overview · Country Comparison · Initial Design · Evidence · AI Adviser · Deliverables</span></div>
        <div className="architecture-connector">HTTPS requests ↓</div>
        <div className="architecture-layer server-layer"><small>02 / Application server</small><strong>Cloudflare Worker · vinext · Sites hosting</strong><span>Identity and roles · project APIs · adviser and research · refresh validation · shared calculations</span></div>
        <div className="architecture-connector">Controlled connections ↓</div>
        <div className="architecture-providers"><div><small>Persistence</small><strong>Cloudflare D1</strong><span>Designs, evidence and audits</span></div><div><small>AI provider</small><strong>OpenAI Responses API</strong><span>Grounded answers and research</span></div><div><small>Data providers</small><strong>Eurostat + Ember</strong><span>Electricity and energy metrics</span></div></div>
      </div>
    </section>

    <section id="d1-schema" className="mini-card deliverable-section"><span className="eyebrow">03 · D1 schema</span><h2>Persistent project records</h2><p>The schema is versioned through seven ordered migrations. Application registration stores Sites identity, not passwords.</p><div className="schema-grid">{schema.map(([name,purpose])=><article key={name}><code>{name}</code><p>{purpose}</p></article>)}</div></section>

    <section id="sources-and-apis" className="mini-card deliverable-section"><span className="eyebrow">04 · External sources and APIs</span><h2>Server-side integrations</h2><div className="table-scroll"><table><thead><tr><th>Provider</th><th>Use</th><th>Boundary</th></tr></thead><tbody><tr><th><a href="https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2" target="_blank" rel="noreferrer">Eurostat ↗</a></th><td>National non-household electricity-price reference</td><td>National statistic, not a site tariff or supplier offer</td></tr><tr><th><a href="https://api.ember-energy.org/" target="_blank" rel="noreferrer">Ember ↗</a></th><td>Demand, generation and carbon-intensity records</td><td>National annual data; demand uses a labeled 12-month fallback</td></tr><tr><th><a href="https://platform.openai.com/docs/api-reference/responses" target="_blank" rel="noreferrer">OpenAI Responses API ↗</a></th><td>Registered-user adviser and separate evidence research</td><td>Server-only key, rate limit and source validation</td></tr></tbody></table></div><p><a href="/evidence">Open the Evidence page</a> for all {sourceCount} source records, dates, claim classifications and human checks.</p></section>

    <section id="functional-requirements" className="mini-card deliverable-section"><span className="eyebrow">06 · Functional requirements</span><h2>FR1–FR10 implementation</h2><div className="table-scroll"><table><thead><tr><th>ID</th><th>Requirement</th><th>Implementation</th><th>Status</th></tr></thead><tbody>{requirements.map(([id,requirement,implementation,status])=><tr key={id}><th>{id}</th><td>{requirement}</td><td>{implementation}</td><td><span className="deliverable-status complete">{status}</span></td></tr>)}</tbody></table></div></section>

    <section id="test-results" className="mini-card deliverable-section"><span className="eyebrow">07 · Test results</span><h2>Current verification status</h2><p><b>Automated checks:</b> 72 passed, 0 failed, 0 skipped. Type checking and the production build also pass.</p><div className="table-scroll"><table><thead><tr><th>Check</th><th>Coverage</th><th>Status</th></tr></thead><tbody>{tests.map(([id,coverage,status])=><tr key={id}><th>{id}</th><td>{coverage}</td><td><span className={`deliverable-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div><p className="caption">Pass records the stated observed case. Partial means only part of the required scope has been demonstrated.</p></section>

    <section id="request-flow" className="mini-card deliverable-section"><span className="eyebrow">09 · Individual explanation</span><h2>Trace one adviser request</h2><ol className="request-flow"><li><b>Browser</b><span>Sends the question and current page context without API credentials.</span></li><li><b>Access checks</b><span>The server verifies Sites identity, registration and the request limit.</span></li><li><b>D1 and tools</b><span>Saved design inputs and relevant evidence are retrieved through allowlisted tools.</span></li><li><b>OpenAI</b><span>The model explains the evidence, assumptions and unknowns.</span></li><li><b>Validation</b><span>The server rejects unknown source IDs and validates the response structure.</span></li><li><b>Browser response</b><span>The accepted answer returns with real citation links. The Adviser cannot edit the design.</span></li></ol><p className="pending-note">Each team member must still give this explanation in their own words.</p></section>
  </div>
}
