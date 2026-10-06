# Grid research and Ember fallback — 6 October 2026

## Root causes and changes

The grid failure was reproduced with a citation to RTE’s `services-rte.eu` English services portal. The configured domains included `.com` and `.fr` but omitted `.eu`. Its connection page was compared with the matching official `.com` page. The verified alias is now allowed for French grid research only. Lookalike domains and cross-country context remain rejected. Citation rejections now log sanitized origin/path (no credentials, query strings, fragments, answer text or user question).

- [RTE English services page](https://www.services-rte.eu/en/learn-more-about-our-services/connect-an-installation-to-the-public-transmission-network.html)
- [Matching .com portal page](https://www.services-rte.com/en/learn-more-about-our-services/connect-an-installation-to-the-public-transmission-network.html)

Ember’s yearly demand request returned HTTP 500 both with entity code and a documented country-name query. Its documented monthly demand endpoint returned HTTP 200. After a yearly demand server error, the application can now sum exactly twelve unique, finite, nonnegative monthly observations for the requested country/year. It rejects missing, duplicate, foreign-year and invalid observations. Authentication failures do not trigger this fallback. Failure of both paths retains the stored value and original retrieval date.

Successful monthly sums carry `method: monthly_sum`, a credential-free source URL and a note explaining the yearly failure. The Country Comparison provenance, refresh record and Adviser receive the method. A monthly sum may differ from the separately revised yearly series; this does not mean the yearly endpoint itself was repaired. No database migration or permission change is required.

- [Ember endpoint documentation](https://api.ember-energy.org/v1/docs)

## Verification

- Unit suite: 72 passed, 0 failed, 0 skipped. Typecheck passed.
- Live grid search + source validation + evidence review: passed on the first attempt, citing `services-rte.eu`. [Exact report](qa/grid-repair-live-2026-10-06.json).
- Live Ember 2024 demand fallback: France 428.07 TWh; Germany 498.26 TWh; Sweden 130.33 TWh. Each is a sum of twelve monthly observations, not an annual-endpoint response. Generation and carbon intensity continued to use yearly endpoints. [Exact report](qa/ember-fallback-live-2026-10-06.json).
- Existing Adviser permissions, saved design defaults and human verification records were not changed by the isolated checks.
- Production publication and hosted results are recorded after deployment below.

## Hosted publication

Version 39 deployed successfully at 2026-10-06T13:17:33Z from `ae3042be5673265ce510a5fd38d404055f107921`. The hosted French grid research returned a cited RTE PTF explanation automatically at 13:18:04 UTC, using the formerly rejected `services-rte.eu` domain; no manual retry was needed. This verifies the reported domain rejection on the published site.

The hosted Adviser was explicitly asked to query Ember live for France, Germany and Sweden in 2024 without saving data. It returned 428.07, 498.26 and 130.33 TWh respectively, cited S-EMBER, and stated that all three were sums of twelve monthly observations because the yearly endpoint returned HTTP 500. It also disclosed that these sums may differ from the separately revised yearly series. This verifies the read-only hosted provider path and model disclosure. At that stage, the full persisted refresh had not yet run; it was subsequently completed as recorded below.

## Full hosted refresh and database readback

On 6 October 2026, an authenticated administrator triggered the published Evidence page’s **Refresh energy data** action. The saved refresh record (id 2, started 13:24:06.646 UTC) reports **success: 81 energy metrics updated; 0 unavailable; 27 demand totals calculated from 12 monthly observations**. A separate uncached public `/api/data` read at 13:25:12.424 UTC verified all 27 countries, all 81 live metric values, matching top-level database values, new per-metric retrieval times and all 27 monthly-sum labels. Electricity prices were unchanged.

The three project-country demand values saved were France 428.07 TWh, Germany 498.26 TWh and Sweden 130.33 TWh for 2024. The yearly upstream demand endpoint is still unavailable; this is a successful application fallback and persisted refresh, not a claim that Ember’s yearly endpoint recovered. Generation mix was not refreshed.

[All 27 saved country observations and the refresh record](qa/ember-full-refresh-2026-10-06.json). This closes the previously pending full-refresh acceptance check. No code change or new deployment was needed to execute it.
