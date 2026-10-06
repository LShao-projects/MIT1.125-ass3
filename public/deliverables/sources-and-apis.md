# External sources and APIs

All external calls run on the Sites backend. Credentials are hosted secrets and are never returned to the browser. National figures support comparison; they do not replace site quotations, grid studies or engineering surveys.

## Server-side APIs

| Provider | Used for | Scope and limitation |
|---|---|---|
| [Eurostat dissemination API](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2) | Large non-household electricity-price references | 2025-S2 national statistic; not a site tariff |
| [Ember API](https://api.ember-energy.org/) | Electricity demand, generation mix and carbon intensity | Annual national data; the validated fallback sums twelve complete monthly observations |
| [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) | Grounded adviser answers and evidence research | Server-only key, rate limit and validated source IDs |

## Curated source records

| ID | Publisher and source | Period / coverage |
|---|---|---|
| S-EUROSTAT | [Eurostat — Electricity prices for non-household consumers](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=EN&nrg_cons=MWH_GE150000&currency=EUR&unit=KWH&tax=X_VAT&time=2025-S2) | 2025-S2 |
| S-EMBER | [Ember — Yearly electricity data](https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_yearly_global.csv) | 2024 EU country records |
| S-EPOCH-DC | [Epoch AI — AI data centers database](https://epoch.ai/data/data_centers/data_centers.csv) | Snapshot downloaded by 2026-10-03 |
| S-EPOCH-GPU | [Epoch AI — GPU clusters database](https://epoch.ai/data/gpu_clusters.csv) | Snapshot downloaded by 2026-10-03 |
| S-DE-01 | [Bundesnetzagentur — Electricity market in 2024](https://www.bundesnetzagentur.de/1043444) | Germany, 2024 |
| S-DE-COOL | [Forschungszentrum Jülich — Exascale Site Update](https://juser.fz-juelich.de/record/1020008) | Germany, 2023 |
| S-DE-DIRECTORY | [Data Center Map — Germany](https://www.datacentermap.com/germany/) | Snapshot 2026-10-05 |
| S-DE-NATIONAL | [Bitkom / Borderstep — Rechenzentren in Deutschland](https://www.bitkom.org/Presse/Presseinformation/Rechenzentren-Deutschland-KI-treibt-Wachstum) | Germany, 2025 |
| S-FR-01 | [RTE — Annual electricity review 2024](https://analysesetdonnees.rte-france.com/en/annual-review-2024/keyfindings) | France, 2024 |
| S-FR-COOL | [CNRS Images — Jean Zay heat recovery](https://images.cnrs.fr/photo/20250008_0023) | France, 2025 |
| S-FR-DIRECTORY | [Data Center Map — France](https://www.datacentermap.com/france/) | Snapshot 2026-10-05 |
| S-FR-NATIONAL | [SDES — Datacenter electricity consumption](https://www.statistiques.developpement-durable.gouv.fr/la-consommation-delectricite-des-data-centers-en-2024?list-chiffres=true) | France, 2024 |
| S-SE-01 | [Swedish Energy Agency — Electricity and district heat](https://www.energimyndigheten.se/nyhetsarkiv/2025/slutgiltig-statistik-for-el-och-fjarrvarme-2024/) | Sweden, 2024 |
| S-SE-COOL | [National Supercomputer Centre — Facilities](https://nsc.liu.se/about/facilities/) | Facility description |
| S-SE-DIRECTORY | [Data Center Map — Sweden](https://www.datacentermap.com/sweden/) | Snapshot 2026-10-05 |
| S-SE-NATIONAL | [RISE — Datacenter energy use](https://www.ri.se/en/the-status-of-data-center-and-crypto-mining-energy-use-in-sweden) | Sweden, 2022 |

`S-CALC` is the internal deterministic project model and is not an external source.
