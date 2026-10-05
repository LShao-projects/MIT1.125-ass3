# Committee dashboard revision

Baseline: main and tag baseline-before-committee-dashboard, commit 948181a.
Development branch: committee-dashboard-v2. Production has not been updated.

## Implemented
- Four workspaces: committee decision, requirements/design/cost, country comparison, evidence.
- Formal proposal is separate from personal demand and cost trials.
- Annual productive hours and peak concurrency determine an illustrative capacity requirement; missing demand stays unknown.
- Public design/data reads; registered adviser; editor evidence writes; explicit ADMIN_USER_IDS required for formal design updates.
- Atomic formal design save plus immutable proposal_versions record in D1, including requirements.
- Personal saved scenarios and JSON exports include demand requirements.
- Adviser receives formal requirements/version and clearly separated personal inputs.
- Committee screen identifies evidence gaps, investment readiness, risk allocation and alternatives.
- Existing nine-case economics, failure modes, country evidence, docked adviser and source review remain available.

## Verification
- 18 unit tests passed, including missing demand, peak constraint and productive-yield treatment.
- TypeScript check and production build pass.
- Local anonymous design/data reads return 200; anonymous adviser and design writes return 401.
- Browser: personal 2.5 MW scenario leaves formal 25 MW proposal unchanged.
- Local D1 proposal_versions migration applied; cloud migration not applied.

## Required before claiming assignment completion
- Three real human reviews, attributed to the people who actually read the documents.
- Verify a successful external API refresh and retained last-good data on failure.
- Set actual production admin IDs and verify registered viewer/editor/admin permissions.
- Current committee assessment is a conservative authored screening statement, not an automatically approved investment or an editable committee resolution.
- Choose and evidence the formal country/site/strategy; current formal version stores inputs and requirements, not a finalized location recommendation.
- Complete claim-level metrics/source/version traceability and full role/e2e/prompt-injection acceptance tests.
- Produce and freeze the memo, diagrams, presentation, demo recording and individual technical explanation.
- Real provider bids, signed demand and site engineering remain unknown.

No human verification, construction approval, cloud migration or live adviser test is claimed by this revision.
