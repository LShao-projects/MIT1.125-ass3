# Local first version

Plan: ../PROJECT_PLAN.zh-CN.md. User requested local development in this folder, empty secret slots, and no deployment.

## Design

Common Ground is a university infrastructure decision workspace. The European map and an adjacent country brief are its main surface. A quiet vertical navigation keeps the six related research tasks in view.

Palette: ink #152e46, teal #087c83, sky #e8f3f6, paper #f6f8fa, muted #607486, amber #aa6508. Typography: Avenir Next with Segoe UI/system fallback; human-readable numbers with tabular alignment. Left-aligned copy, compact chart notes, restrained borders. No stock imagery is needed for this evidence-led task.

## Tasks

- [x] Seed real EU data and geographic boundaries with attribution.
- [x] Deterministic nine-case model and dimensional/stress tests.
- [x] D1 schema, protected API routes, data refresh, verification records and adviser.
- [x] Six-page responsive interface and source inspection.
- [x] Local configuration, migrations, tests, build and browser verification.

## Integration checks

| Producer / consumer | Contract | Resolution |
|---|---|---|
| Dataset / API and UI | countries, sources, cases; 27 ISO-mapped records | Missing values remain null; verification pending |
| Model / UI and API | validated numeric inputs; nine route-scenario results | Server recomputes saved/AI outputs |
| Identity / write routes | Sites helper with separate application registration | Local starter sign-in is explicitly marked simulated; production auth remains pending deployment |
| Secrets / connectors | .dev.vars server environment | Blank placeholders only; no keys requested in chat |
| Existing plan / local delivery | Sites-compatible source, D1 local persistence | Work in requested folder; no publishing, no worktree/merge required for this new non-git workspace |

Superpowers implementation and verification workflow is used with bounded model/data/backend tasks. Frontend Design guides layout; Humanizer checks embedded product copy. The user has already approved the project plan; this implementation does not repeat brainstorming or request another plan approval.

Verification: 11 model/backend unit tests, 13 local API checks, TypeScript and production build passed. Browser checks cover real EU map, country comparison and responsive layout; live keyed Ember/OpenAI calls remain pending user configuration. No human verification is claimed.

Live refresh check: Eurostat endpoint and parser succeeded via direct CLI, but local Worker outbound fetch returned an internal runtime error. Atomic failure handling retained all 27 countries and logged the failure. Live refresh is an outstanding integration issue, not a verified successful connector. Desktop and 390px mobile layout and navigation verified; viewport override reset.

## Interaction revision — 2026-10-03

Applied explicit user feedback: login-first entry with registered access checks on data/design reads; five navigation pages plus persistent contextual adviser; 17px body / 16px table text; left-hand country filter; equal-area map and hover/focus evidence; generation mix grouped by source with percentages; one design page and one stateful failure diagram; consolidated cost controls.

Verified: TypeScript/build, existing 11 unit tests, 16 local endpoint checks, 1440px desktop and 390px mobile browser checks, country add/remove, keyboard map detail, sign-out and sign-in gate, adviser draft/context across pages. Screenshots are in review/. No keys were read, no paid call made, and no deployment performed.

Assignment deviation is deliberate: the user's login-first request supersedes the Step 22 public-design test. This is recorded in SETUP_AND_HISTORY.md and the requirements audit; do not claim every original rubric check currently passes.

Compact workbench revision: one shared left control rail for every view, top navigation, height-constrained entire EU map, right adviser dock with non-overlapping content width, dedicated adviser view on narrow screens, progressive disclosure for secondary tables, EU27 flags, country-specific case empty states and per-record Epoch source buttons. Login copy explicitly states shared simulated identity, already registered for QA; no authentication provider change or cloud database creation. Read-only SQLite inventory confirmed nine business tables and persisted seed/design data.

Browser verification at 1366×850: entire map fits; Explore content has no vertical overflow; content right edge equals adviser left edge. Belgium flag and empty facility sample state verified. Shared design condition selector still changes the failure diagram. Mobile390px source controls open in the same entry point and adviser switches to a dedicated view without horizontal overflow. TypeScript and production build pass. Screenshot: review/explore-v3-docked.jpg.

## Live evidence research (2026-10-05)

The ownership, financing and governance sections expose an on-demand “Search evidence” panel. `/api/research` uses the existing server-only `OPENAI_API_KEY` and `OPENAI_MODEL` (default `gpt-4.1-mini`) with Responses `web_search`, required tool use and live access. It shares the registered-user adviser usage budget (10 attempts in a rolling minute, with no application daily cap). Failed provider attempts reserve usage just like adviser requests.

Research receives only the topic, selected build/lease/hybrid alternative and submitted question, not the full financial model or member records. Results remain in component memory and do not overwrite evidence records, assumptions or adopted decisions. Changing the selected alternative or account hides a mismatched result. Refreshing the page clears results. External factual claims are requested with native URL citations; the backend rejects incomplete responses, missing completed searches, missing citations, invalid citation ranges and unsafe URL protocols. Citation structure is validated; semantic support still requires reading the cited source.

The UI renders inline citation links, source titles/domains, query, route and search time. Research is prompted to use primary sources and separate documented evidence, project implications and unknowns. API/schema errors and quota/configuration failures display explicit messages rather than substitute uncited model text.

Validation: typecheck, targeted ESLint and all 39 tests passed. A real provider request returned HTTP 200 with three official HPC source citations (NJIT, University of Arizona, LSU), successfully parsed by the production parser. Local UI verified the three entry points, editable question and daily-limit error. The existing local test identity had exhausted its daily quota, so an end-to-end successful authenticated UI search was not verified; the live provider test exercised the same payload and parser separately without changing application limits.

The previous arbitrary 20-request daily cap was removed. The requirement audit calls for rate limiting but specifies no daily count; research and adviser now share a short burst limit of 10 attempts per rolling minute per registered user. Token/attempt recording and provider-side limits remain in place. Earlier daily-limit test notes above describe the pre-change behavior.


## Automatic researched design sections (2026-10-05, supersedes on-demand panels)

Ownership and responsibility, effects on other grid customers, financing gates and risk, and proposed governance now render the researched answers as their entire section bodies. The previous static paragraphs/table and search forms are no longer displayed. For registered users with AI configured, opening Design & economics automatically requests all four sections after a short debounce. Each section independently displays loading, a cited answer, or an explicit error with retry. Existing sign-in and registration requirements remain.

The research context includes supply route and selected FR/DE/SE country, rather than hard-coding Paris-Saclay for personal scenarios. Route/country/account changes hide mismatched results. Completed answers are cached in per-account browser memory for up to 24 hours; in-flight identical requests are deduplicated. A full refresh clears this memory. External sources do not overwrite shared model inputs. This is qualitative research, not a recomputation of the financial model.

Search queries are instructed to use topic-specific institutional domains. The server rejects citations outside those domains. This uses query scoping plus output validation because the configured gpt-4.1-mini rejects the web-search API filters parameter. Grid domains vary by country. This controls citation provenance, not semantic truth; the UI identifies the answers as AI synthesis and requires unknown project conditions to remain explicit.

Validation: all four local sections automatically completed with no search clicks, returning 4/4/1/7 inline citations respectively, including GENCI/CEA, RTE and EuroHPC primary sources. TypeScript and targeted lint passed, and 41 tests passed including country context, unsafe citation handling and official-domain enforcement. Visual inspection confirmed directly rendered prose and source lists.


## Compact decision cards (2026-10-05)

The four automatic research sections now use Proposed decision, Rationale, Evidence and Unknowns. Generation targets 100–140 English words per card, with a validated 180-word ceiling and at most two unique citations. Proposals, supplied case assumptions, external facts and unknowns are explicitly separated in the generation instructions. Grid evidence remains mandatory; other topics may state an evidence gap without inventing sources. Citation offsets are preserved when splitting the four fields. Sources are collapsed beneath the cards, with inline citation links retained. Desktop uses two columns and small screens one column. The cache version changed so long answers are not reused.

Validation: 42 tests passed, including compact-format and citation-position checks; TypeScript and targeted lint passed. Live web-search results rendered all four compact cards with native citations. As with all generated research, domain validation does not certify semantic accuracy.
