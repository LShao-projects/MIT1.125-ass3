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
