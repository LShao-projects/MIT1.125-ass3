# Common Ground

A local university AI infrastructure research and investment-decision workspace for MIT 1.125 Assignment 3.

Start with [setup and implementation history](SETUP_AND_HISTORY.md). See the [requirements audit](docs/REQUIREMENTS_AUDIT.md) for verified functionality and outstanding acceptance work.

```sh
npm run dev -- --hostname 127.0.0.1
```

The development machine's local database is initialized. Fresh installations must apply the migrations described in the setup guide. Put server-only keys in `.dev.vars`, using `.dev.vars.example` as the template. The published site is [Common Ground](https://common-ground-datacenter.lynnyu.chatgpt.site/); production secrets are configured separately in Sites.

## Architecture

```mermaid
flowchart TB
    visitor["Visitor / consortium member"]
    auth["Sites sign-in with ChatGPT"]

    subgraph browser["Browser — React interface"]
        pages["Overview · Country Comparison · Initial Design<br/>Evidence · AI Adviser"]
        scenario["Local scenario exploration<br/>Deterministic energy and cost calculations"]
    end

    subgraph server["Sites hosting — Cloudflare Worker / vinext"]
        access["Server checks<br/>Identity · registration · role · same-origin writes"]
        public["Public read APIs<br/>GET /api/data · GET /api/design"]
        writes["Protected writes<br/>Design revisions · source checks · member roles"]
        adviser["POST /api/adviser<br/>Controlled read tools · citation validation"]
        research["POST /api/research<br/>Web search · official-source checks<br/>Format validation · one bounded retry"]
        refresh["POST /api/refresh<br/>Eurostat and per-metric Ember refresh"]
        model["Shared deterministic model<br/>Energy · GPU capacity · three-route cash flows"]
        secrets["Server-only configuration<br/>API keys · model · role allowlists"]
    end

    db[("Cloudflare D1 via Drizzle<br/>Countries · sources · claims · human checks<br/>Users · designs · revisions · scenarios<br/>Refresh history · AI usage · role audit")]
    openai["OpenAI Responses API<br/>Adviser generation / research web search"]
    providers["Approved data providers<br/>Eurostat · Ember"]

    visitor --> pages
    visitor --> auth
    auth -->|"Trusted identity headers"| access
    pages --> scenario
    pages --> public
    pages -->|"Authenticated requests"| access
    access --> writes
    access --> adviser
    access --> research
    access --> refresh
    public -->|"Read"| db
    writes -->|"Persist and audit"| db
    adviser -->|"Read current records; record usage"| db
    adviser --> model
    adviser <-->|"Controlled tool calls and answers"| openai
    adviser -->|"Explicit live-source requests; no data writes"| providers
    research <-->|"Search with URL citations"| openai
    research -->|"Record usage"| db
    refresh --> providers
    refresh -->|"Persist successful metrics; retain failed values and dates"| db
    secrets -.-> adviser
    secrets -.-> research
    secrets -.-> refresh
    secrets -.-> access
```

- **Access:** anyone can read the dashboard. Registered users can use the adviser and web research. Editors/admins can refresh data and record source checks; admins can revise the shared design and manage roles. The adviser and research share a limit of 10 requests per minute per user.
- **Saved design versus exploration:** optional browser scenarios do not overwrite the shared proposal. An admin's saved PUE revision is persisted in D1 and read by subsequent adviser requests. Both the interface and server use the shared calculation modules.
- **Two AI paths:** the adviser reads project records through allowlisted tools and can query Eurostat/Ember when explicitly asked. It has no general web search and cannot edit the model. The separate research endpoint searches the web and validates citation URLs against approved official domains. These checks do not guarantee that every generated claim is supported.
- **Data provenance:** Ember generation, demand and carbon intensity refresh independently. Failed metrics retain their stored values and original retrieval dates; generation mix is not refreshed by these calls. Refresh history records partial failures. Human verification remains a separate reviewer action.
- **Deployment:** source is built and packaged for Sites; Drizzle migrations update D1 before the Worker is deployed. Runtime API keys stay on the server and are never sent to the browser. No R2 storage is configured.

Implementation: [page workspace](app/minimal-workspace.tsx), [API routes](app/api), [authorization](lib/server/core.ts), [adviser tools](lib/adviser-policy.ts), [calculation model](lib/model.ts), [Ember integration](lib/server/ember.ts), [research validation](lib/research.ts), and [database schema](db/schema.ts).
