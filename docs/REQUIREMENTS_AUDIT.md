# Assignment requirements and project-plan audit

Initial review date: 2026-10-03. Later dated sections supersede the initial status assessment.

Basis: the user-provided *Lesson 06 — Build a DataCenter Challenge.docx*, located by heading, phase, and step. No additional rubric or course announcements were assumed. The reviewed project plan is a local planning document outside this repository. Section references below refer to that document. This initial audit assesses plan coverage, not runtime acceptance or a guaranteed grade.

After revision, the explicit analysis topics, FR1–FR10, all 26 building steps, and both deliverable groups had planned coverage. Data and platform dependencies remained open, particularly Step 11's reported national datacenter counts and capacity/electricity use. Unknown placeholders do not establish complete data coverage or full compliance.

## 1. Initial findings and corrections

| Topic | Finding | Revision |
|---|---|---|
| Chosen-country narrative | Starting with a German consortium and then recommending another country could drift from the brief | Fix the assumed workload first; identify the chosen country and its consortium; show cross-border leasing separately |
| Starting facts and exclusions | Scattered statements could be overwritten by later modeling | Preserve absent long-term commitments, three grid unknowns, three equipment acquisition routes, and unresolved small-member rules; clarify construction, grid-control, and professional-finance boundaries |
| National facility metrics | Honest unknowns do not complete Step 11 | Make collection and acceptance a separate requirement; retain open risk when missing; substituting examples requires course approval |
| Authentication | Generic sign-in/registration was underspecified | Require Sites Sign in with ChatGPT; no passwords in users; simulated login cannot pass production acceptance |
| Engineering process | Schema, migrations, and binding were too general | Specify schema.ts, SQL review, separate seed, immutable applied migrations, DB binding, and deployment checks |
| AI context | Retrieval and permissions existed, but context boundaries were vague | Load authoritative data on the server, send only relevant records, and distrust client assertions |
| Test granularity | Tests were scattered | Collect the twelve functional checks, injection test, request tracing, and hosted retest here |

## 2. Investment analysis and initial design

“Covered” in this initial section means planned, not delivered.

| Requirement | Plan sections | Review and required evidence |
|---|---|---|
| Starting 25 MW includes computing and cooling | 1, 16.4 | Covered: 20 MW × 1.25, 8,760 hours, 219 GWh full-load baseline |
| No long-term commitments; unknown grid; hardware choices; diverse demand; small members | 1, 11, 12 | Explicit; assumptions must not become claimed contracts or secured grid access |
| Size changes allowed with justification | 11.1, 15.3 | Demand/concurrency calculations must justify 25 MW or smaller phases |
| Committee may approve, reject, or return for evidence | 1, 13, 15.1 | Memo/homepage need a clear recommendation and evidence conditions; no extra voting system required |
| Demand, timing, security, availability, GPU-hours | 10, 11.1, 15.3 | Demand table and capacity/shortfall analysis pending |
| Grid, UPS, backup, cooling, network, storage, GPUs | 12.1, 15.3 | Configuration, power budget, and diagram pending |
| Largest electrical component failure and 48-hour grid outage | 12.1, 15.3 | Failure paths, remaining capacity, endurance, and recovery need validation |
| Ten-year economics; facility/GPU separation; full costs and idle assets | 6, 11.2–11.3, 15.4 | Cost inputs and reproducible annual results pending |
| Build/own, lease, phased hybrid | 6, 11.3, 15.4 | Common demand and service boundaries; avoid prices for unlike services |
| Financing: three funding categories; delay/demand/exit risk | 12.2, 15.4 | Preconditions and responsibility table planned |
| Governance: ownership, quotas, pricing, access, conflict, fairness | 12.3, 15.3 | Rules and three evaluation scenarios planned |
| Alternatives/externalities: existing/distributed facilities, energy, water, permits, grid users | 12.4, 15.2 | Project and regional evidence pending |
| Base, one-year grid delay, half utilization | 11.3, 15.4 | Three strategies × three scenarios, with separate mechanisms |
| Pre-opening cash, annual OPEX, cost/productive GPU-hour, capital at risk | 11.3, 15.4 | Definitions and annual detail; memo summary plus full web table |
| On-site energy contribution over time and uptime evidence | 6, 12.1 | Required if solar/wind/gas/storage is selected; UPS/backup endurance also needs analysis |
| Step 2 region, water, network, expected power source, engineering unknowns | 3D, 10–12, 15.3 | Design register needed; national water risk cannot replace water demand |

The brief permits combinations of six decision categories. This plan covers all six with emphasis on requirements, technology, and economics. That flexibility does not waive explicit required analysis or deliverables.

## 3. Mapping all 26 building steps

| Step | Requirement | Planned implementation/acceptance |
|---|---|---|
| 1 | FR1–10 and exclusions | Sections 1, 18: all ten and exclusions covered |
| 2 | Initial values and assumptions | Sections 1, 10–12, 15.3; justify capacity changes |
| 3 | Separate evidence, assumptions, calculations, design decisions | Sections 4, 16; include estimates and unknowns for AI context |
| 4 | D1 schema | Section 16.3; six core tables plus necessary extensions; users has no passwords |
| 5 | Appropriate indexes | Section 16.3; justify by queries rather than copying redundant indexes |
| 6 | Sites server application | Sections 16.3, 17; a static prototype is insufficient |
| 7 | D1 binding | Section 16.3; DB binding checked against current course capabilities |
| 8 | Schema → migration → review → apply; separate seed | Section 16.3; never rewrite deployed migrations |
| 9 | Verified three-country seed, eight metadata fields, NULL | Sections 3–4, 16.2; value/unit/period/organization/link/retrieval date/definition/limitations |
| 10 | Server data layer and parameterized SQL | Section 16.3; shared by UI and AI; no SQL built from untrusted input |
| 11 | Five core surfaces and required fields | Section 15's six planned pages include all five plus economics; national facility statistics remain a risk |
| 12 | Deterministic application calculations | Section 16.4; test formulas/boundaries; AI explains |
| 13 | At least one real API and three human checks; optional documents | Sections 3, 8, 16.1–16.2; Eurostat and team review; PDF/R2 optional |
| 14 | Protected refresh, validation, failure retention | Sections 15.5, 16.3; check HTTP/schema/numbers/units/period/source time/scope |
| 15 | Server-hosted secrets | Sections 8, 15.6, 16.3; no browser/repository exposure; user-owned API project replaces an unavailable course service |
| 16 | Sign in with ChatGPT and application registration | Section 15.6; stable identity and separate registration state |
| 17 | Server role permissions | Sections 2, 16.3; protect AI, edits, refresh, and shared design |
| 18 | Narrow evidence-grounded AI task | Section 15.6; current design, limits, unknowns, no fabricated facts |
| 19 | Controlled tools | Section 15.6; design/metrics/sources/calculation; no arbitrary URLs; backend refresh supplies the real API integration |
| 20 | Server request assembly, rate limits, relevant context | Section 15.6; identity → registration → limit → D1 → OpenAI → citations |
| 21 | Real source IDs, assumptions, unknowns | Section 15.6; verify supporting evidence as well as ID validity |
| 22 | Twelve functional tests | T01–T12 below; retain individual results |
| 23 | Prompt injection test | T13; malicious source text must not override model rules |
| 24 | Explain browser/D1/model flow | T14, section 13.3; every member understands |
| 25 | Sites deployment and retest | Sections 16.3, 17; configuration, build, production checks |
| 26 | Nine engineering deliverables | Sections 9, 13 and deliverable table below |

## 4. Required test checklist

All tests were pending at the initial plan review. Planning does not constitute passing a test.

| ID | Action | Pass criterion |
|---|---|---|
| T01 | Open while signed out | Public design and evidence visible |
| T02 | Call AI endpoint anonymously | Server rejects, independently of UI visibility |
| T03 | Authenticate without application registration | Registration required; AI denied |
| T04 | Complete registration | Real AI calls allowed |
| T05 | Ask current PUE | Answer matches current D1 design/version |
| T06 | Administrator changes shared PUE | UI calculations and subsequent AI reflect it; personal trials do not alter baseline |
| T07 | Ask for missing facts | Explicit evidence gap, no invention |
| T08 | Authorized external API refresh | Actual request succeeds; records/retrieval time saved and shown; unchanged values are not claimed as new statistics |
| T09 | Simulate upstream failure | Last valid data retained; failure and historical dates visible |
| T10 | Unauthorized edit/refresh | Server rejects without mutation |
| T11 | Request supporting evidence | Real D1 citations support the claims |
| T12 | Request professional certification | Adviser states initial-design limits and does not certify |
| T13 | Put malicious instructions in a source | AI treats them as data and does not follow them or alter recommendations accordingly |
| T14 | Trace and explain a request | Identity/registration → relevant D1 records → controlled tools → model → citations |
| T15 | Hosted retest | Repeat T01–T13 and calculation checks at production URL; build/migrations succeed |

Record environment, version, date, steps, expected/actual results, and evidence. Retest repaired failures specifically.

## 5. Both deliverable groups

| Origin | Deliverable | Plan |
|---|---|---|
| Challenge | Web model with visible assumptions and sensitivity | Section 15 |
| Challenge | One-page power/cooling/network/failure diagram | Sections 12.1, 15.3 |
| Challenge | Five-minute committee presentation and Q&A | Section 13.2 |
| Challenge | Two-page memo with recommendation and three decision-changing findings | Section 13.1 |
| Step 26 | Published URL entered in shared document | Sections 9, 17; team submits |
| Step 26 | Software architecture diagram | Sections 9, 16.3; physical diagram is not a substitute |
| Step 26 | D1 schema | Section 16.3 |
| Step 26 | External source/API list | Sections 3, 8, 16.1 |
| Step 26 | Initial datacenter design | Sections 10–12, 15.3 |
| Step 26 | Functional requirements table | Section 18 |
| Step 26 | Test results | T01–T15, initially pending |
| Step 26 | Two-minute demonstration video | Section 13.3 |
| Step 26 | Each member's short request-flow explanation | Section 13.3 |

## 6. Initial open dependencies and compliance assessment

1. National facility statistics: collect reported counts and capacity/electricity with scope and gaps. Unavailable data remain required; submitting unknowns carries grading risk.
2. Human verification: candidate sources are not three completed team checks. Actual review records are needed.
3. Sites/D1/ChatGPT sign-in/OpenAI: the specified platform path still needs real deployment and validation.
4. Demand, location, costs, failure analysis, and ten-year calculations: planned methods are not completed analysis. Reproducible outputs and explicit uncertainty are required even when assumptions are permitted.
5. Final memo, presentation, video, and individual explanations were pending at the initial audit.

An EU map, 27 countries, five focus countries, six navigation pages, and extra tables are design choices rather than fixed course counts. The brief requires at least three countries, one real external API, and three human-verified records. PDF/R2 and arbitrary live search are not first-version requirements. Epoch is an initial source but is not required to cover every national metric alone.

Initial conclusion: the revised plan addresses explicit deliverables, but data completeness, real platform integration, and runtime acceptance remain open. Full assignment compliance cannot yet be claimed.

Additional decision: the course provided no OpenAI key, so the user authorized their own API project. This changes the credential provider, not server invocation, secret hosting, permissions, citations, or usage records. At that stage configuration and call validation were still pending.

## Interaction-driven deviation — 2026-10-03

The user requested login-first entry, site-wide Adviser, larger text, and reorganized pages. Data/design reads therefore initially required registration, conflicting with Step 22's public-design test. Public access or an explanation to the instructor was required before submission. The standalone Adviser became a global panel retaining suggested questions, conversation, citations, identity, and initial-design limits, plus page/recent-message context. Evidence retained the filterable source table.

## Implementation acceptance update — 2026-10-05

This update supersedes earlier current-status judgments. The full original DOCX was reviewed again. **Not all requirements are complete.** The login-first deviation was removed: public design and evidence APIs no longer require sign-in. Code existence is not equivalent to hosted acceptance.

| Requirement | Current evidence | Status |
|---|---|---|
| FR1 / Overview / Step 2 | France / Paris-Saclay; original 20 MW IT, PUE 1.25, 25 MW, 219 GWh; decision, reasons, three evidence needs | Implemented locally |
| FR2 / Country Comparison | DE/FR/SE listings 533/393/122 (2026-10-05); electricity 21.3 TWh DE 2025 estimate, 4.3 TWh FR 2024 limited scope, 2.8–3.2 TWh SE 2022 estimate; mix/carbon/cooling/sources/scope/year | Implemented locally; human checks pending |
| FR3 / Steps 3–10 | D1 countries, sources, designs, versions, classified claims; migration 0004 and 11 design_claims applied locally | Production migration unverified |
| FR4 / FR9 / Steps 13–14 | Protected real Eurostat API refresh; failed validation does not commit data; request returned upstream-failure 503 | Successful refresh not passed |
| FR5–7 / Adviser | Registration, controlled tools, limits, source-ID validation, conversation, citations, initial-design statement | Implemented; full live AI acceptance not rerun |
| FR8 / FR10 | Fact/Estimate/Assumption/Calculation/Design decision/Unknown; new claims include period/source/unit/scope/update time; retrieval dates in source details | Implemented locally; legacy timestamp gaps noted below |
| Step 11 Initial Design | Grid, backup, A/B distribution, UPS, GPUs, cooling, storage, dual carriers; timing/security/service targets; component failure, UPS bridging, 48-hour calculation | Conceptual; explicitly not engineering-validated |
| Required analysis / Step 12 | Three strategies × three stresses × four metrics; separate ten-year facility/GPU cash flows; delayed pre-opening cash includes years 0 and 1 | 30 unit tests passed at this review |
| PUE synchronization | Admin saves PUE; UI and team AI reconstruct D1 inputs; original 25 MW reference separate; client cannot forge team inputs | Type/calculation tests passed; admin/live-AI end-to-end check pending |
| Step 13 human checks | Zero current human checks in D1; machine-retrieved sources do not count | Incomplete; people must read and record reviews |
| Steps 15–17 | Server secrets/permissions; anonymous AI 401, anonymous refresh 401, editor design update 403, cross-origin write 403 | Local API tests passed; real Sites auth pending |
| Step 22 | 13 local API checks: public access, anonymous rejection, existing test registration, non-admin write protection | Partial; independent unregistered identity, admin save, live AI still lack this run's evidence |
| Step 23 | Source text explicitly untrusted; client system-role history rejected | Not a completed malicious-source test |
| Step 24 | Browser → identity/registration → D1 sources/claims/design → tools → OpenAI → source-ID checks → citations | Traceable; individual explanation pending |
| Steps 25–26 | Local build and DB binding present; user requested local development | Published URL, hosted secrets, production retest pending |
| One-page physical diagram | Design page adds dedicated print styling/action | Implemented; final page count initially pending |
| Two-page memo / five-minute presentation | Pages supply analysis material | Standalone deliverables initially pending |
| Two-minute video / individual explanation | Local UI/code can be demonstrated | Pending |

### Key corrections

1. Delayed `preOpeningCash` previously counted only year 0. It now includes year 1 deferred GPU purchases, bridge leasing, fixed costs, and financing. Pure leasing is unaffected by owned-facility grid delay.
2. Team AI inputs are reconstructed from D1 instead of treating browser values as authoritative.
3. Initial PUE remains 1.25; administrators can save a labeled efficiency revision to support the synchronization test.
4. Classified claims persist and enter AI context. National counts/consumption have sources and distinct statistical scopes; misleading average energy-per-facility calculations are prohibited.
5. Tests now reflect public-data access and correct editor/admin privileges.

### Suggested human checks

Prioritize S-DE-NATIONAL, S-FR-NATIONAL, and S-SE-NATIONAL. Verify original values, periods, boundaries, measured versus estimated status, and page consistency. Enter notes in the Evidence source dialog and confirm actual human reading. Automated fetching or AI reading is not human verification.

### Completion conditions

Close the remaining gaps individually: successful external refresh and failure retention; real AI questions/injection/PUE synchronization; three human checks; exported one-page diagram, two-page memo, five-minute presentation; deployment/real authentication; video and individual explanation. Page coverage alone cannot demonstrate full compliance.

### Final additions from that review

- Two-page memo and one-page system-diagram PDFs were generated; page counts and all three rendered pages were checked. Downloads appear in the footer. Values freeze the original 2026-10-05 planning snapshot.
- Presentation outline, video script, software architecture, and individual explanation outline appear in [setup and history](../SETUP_AND_HISTORY.md). Actual presentation/video remain incomplete.
- Real AI retest returned 429 because the test identity reached its daily quota. No reset or bypass was performed; this does not pass live questions/PUE/auth-boundary/injection acceptance.
- Eurostat failure was traced to local Worker outbound internal error, reproduced after restarting with network permission. Runtime/environment investigation or hosted validation remains necessary.
- Some legacy sources lack exact `retrievedAt`; only the 2026-10-03 archive review is known. FR10 still needs real retrieval records; do not invent historical dates.

### Phase 7 update — 2026-10-05

The user confirmed Steps 16–17: retain Sites login; do not implement custom email authentication or BYOK. Registration includes course section, team, rules consent time/version, with identity from Sites. Server registration/role checks, administrator role assignment, and auditing are implemented. Public access remains available. All 32 unit tests and 16 local API checks passed; real hosted Sites sign-in remains pending. Roles apply to one shared project; team labels grant no permissions. See the final Phase 7 section in the setup guide.

### Country Comparison map restoration and review — 2026-10-05

- Restored the repository's EuropeMap to Country Comparison: 27 EU records, Europe/world context, three-country shortlist/electricity-price coverage layers, and the existing three-country evidence tables. Browsing the map changes neither team location nor formal proposal. Coverage colors do not encode price magnitude.
- Type checking and production build passed. Browser France → Belgium → France updated tariff/carbon/renewable details while the team candidate remained France. The map rendered correctly on a narrow screen.
- Current local inventory: 27 countries, 17 sources, 11 classified claims; zero human checks; seven failed refresh records; eight sources missing exact retrieval dates. Complete-looking pages do not establish full acceptance.
- Successful live refresh, real AI/PUE/injection checks, three human reviews, hosted Sites sign-in/deployment, presentation/video, and individual request explanation remain pending. PDF drafts are complete; outlines are not completed demonstrations.

### External refresh and source retrieval update — 2026-10-05

- A real Eurostat API request completed through the development-only fixed-target bridge after Miniflare's outbound socket repeatedly returned an internal error. `/api/refresh` returned HTTP 200, wrote 27 country observations and `S-EUROSTAT` at `2026-10-05T20:53:22.098Z`, and retained 17 usable prices. The saved source URL now matches the exact `2025-S2` query. Earlier failed requests retained the prior values. Production Worker networking still requires hosted retesting.
- Six formerly undated external sources were re-accessed at recorded UTC times. Complete Ember/Epoch CSV downloads matched every archived in-scope row (459/3/54); three official pages returned complete content. The hash, time, method, and URL for each are in `data/source-retrieval-audit.json`. Existing D1 records and fresh seeds now expose these times. This is source retrieval, not a human claim check.
- The former eighth undated record, `S-CALC`, is an internal calculator rather than an external source; retrieval is marked not applicable. Current local D1 has zero external sources without an access time. Three current human verification records and the hosted API acceptance test remain outstanding.


## Current acceptance review — 2026-10-05, 22:30 America/New_York

The [acceptance review](ACCEPTANCE_REVIEW_2026-10-05.md) and README test table supersede earlier runtime status summaries. The unit suite rerun passed 53/53. Hosted T07 failed with `unknown_source`; T13 remains unexecuted as a source-injection test, T14 requires individual member explanations, and T15 remains partial. Prior PUE synchronization and partial Ember refresh results retain their documented scope.


## Repair acceptance update — 2026-10-06

The [repair report](ACCEPTANCE_REPAIR_2026-10-06.md) supersedes the preceding failure summary. T07 passed the original hosted question after repair; T12 and PUE synchronization passed hosted regression checks; T13 passed two bounded isolated source-quarantine/live-model cases. Unit suite: 64 passed. Applicable local API checks: 16 passed after the missing local migration was applied. T14 still needs individual explanations; T15 retains fresh-account/non-admin hosted coverage gaps. Ember demand remains an upstream failure.
