# Initial datacenter design

## Committee conclusion

Recommend France as the priority country for the proposed 25 MW university AI datacenter and retain its initial technical design. Return the construction investment for more evidence: signed member demand, a grid connection offer and comparable supplier bids are missing. Continue comparing build, lease and phased hybrid before committing funds.

## How the country comparison leads to France

France moves forward to the next site and supplier study because its saved 2025-S2 electricity-price reference is €0.0614/kWh, close to Sweden's €0.0644 and well below Germany's €0.1307. Sweden has the lowest saved carbon intensity, so it remains the main alternative. These figures come from S-EUROSTAT and S-EMBER.

The comparison narrows the search; it does not select a construction site. Paris-Saclay is a region to investigate. The consortium does not yet have a parcel, grid offer or supplier bid there. A better Swedish total offer, an earlier grid connection or a stronger carbon priority could change the ranking.

## What the baseline means

The assignment starts with a 20 MW IT case. At the working PUE of 1.25, the facility would draw 25 MW and use 219 GWh in a year at continuous full load. This common baseline lets the project compare countries and ownership routes on the same terms. It is not measured demand.

France is the preferred location for the fixed-scale construction concept. Investment approval remains conditional: request signed demand, a grid offer and comparable build/lease/hybrid bids before committing funds. The country comparison determines the preferred location; it does not resize the facility or replace construction with leasing. Build/lease/hybrid economics are supplementary investment comparisons.

## Why the power design has two paths

The A and B distribution paths come from the availability requirement, not from the country comparison. Maintenance or one distribution failure should not disconnect every protected service at once. UPS systems cover the transfer away from grid power, and standby generators carry the agreed critical load during a longer outage. Restartable training jobs can be paused before teaching, inference, storage and network services.

For the 25 MW baseline facility, a ten-minute bridge requires 4.167 MWh of usable AC energy before conversion and aging margins. Running the whole facility for 48 hours would require 1,200 MWh from generators. An illustrative fuel rate of 0.25 L/kWh gives 300,000 litres before reserve. These calculations help size the study; they are not equipment ratings or a certified tank size.

Detailed engineering must check whether the two paths share switchgear, controls, cooling equipment or fuel systems that could fail together. It must also define the protected load, restart sequence and fuel-replenishment plan.

## Why liquid cooling is being studied

Dense GPU racks put a large amount of heat into a small space, which makes direct-to-chip liquid cooling a reasonable option to test. France's Jean Zay system shows that warm-water cooling can work at HPC scale and that recovered heat can feed a local heat network (S-FR-COOL).

Jean Zay establishes technical feasibility. It does not show that a Paris-Saclay site has the same server equipment, water conditions or heat customer. The proposal therefore uses liquid cooling and dry outdoor heat rejection as working assumptions. It assigns no income to heat reuse. Rack density, vendor compatibility, summer temperatures, pumping energy, water quality and water use still need site and supplier studies.

## Why the network is separated

Multi-node training depends on frequent communication between GPUs, so the internal compute network needs high bandwidth and low latency. Workload tests should determine whether Ethernet/RDMA or InfiniBand is the better fit. Parallel storage serves datasets and checkpoints, while a separate management path supports recovery.

Member universities also need reliable external access. Two carrier contracts reduce risk only if their physical routes and building entrances are genuinely separate. An external backup copy provides another recovery route when a network fault or operator mistake affects the main facility.

## What would change the recommendation

France is the next country to investigate, while Sweden stays in the procurement comparison. Construction becomes a credible option after members reserve enough capacity and the team verifies the site-specific power, cooling and network assumptions. Until then, the project should obtain site, grid and supplier offers for the fixed 20 MW IT construction proposal.

This is an initial design concept, not a professional engineering certification or construction-ready design.
