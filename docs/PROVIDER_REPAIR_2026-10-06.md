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
