import type {ReactNode} from 'react';
import type {Route} from '@/lib/model';

type Row = [string, string, string, string];
const cases: Record<Route, {name: string; rows: Row[]; demand: string; details: [string, string][]}> = {
  build: {
    name: 'Build & own',
    rows: [
      ['Facility & equipment', 'Own and fund the facility and GPU fleet, including equipment refresh.', 'Construct the facility and provide specialist maintenance.', 'Upfront capital and idle-asset exposure remain with the consortium.'],
      ['Compute supply', 'Forecast demand and allocate member quotas on the owned fleet.', 'Provide equipment and support under agreed contracts.', 'Lower demand leaves fixed costs spread over fewer productive GPU-hours.'],
      ['Service continuity', 'Set security and availability requirements; oversee power, cooling and recovery.', 'Provide network circuits, maintenance and outage fuel replenishment.', 'Owning backup equipment still requires tested recovery and supply arrangements.'],
    ],
    demand: 'How will members share fixed facility costs and unused GPU capacity?',
    details: [
      ['Building, power & cooling', 'Consortium-owned; construction and specialist maintenance contracted.'],
      ['GPU fleet', 'Purchased or financed by the consortium; refresh and disposal remain its responsibility.'],
      ['Network', 'Internal network and access policies managed by the consortium; two external carriers proposed, with physical route diversity to verify.'],
      ['Operations', 'Consortium sets allocation and security policies; support contracts and staffing remain to agree.'],
      ['Backup power', 'Consortium owns generators and UPS; fuel, maintenance and outage replenishment require contracts.'],
    ],
  },
  lease: {
    name: 'Lease compute',
    rows: [
      ['Facility & equipment', 'Purchase access to compute; no facility or GPU ownership is assumed.', 'Own or arrange the infrastructure and maintain the equipment.', 'The model replaces owned capital with lease spending and minimum commitments.'],
      ['Compute supply', 'Forecast demand, commit contracted capacity and allocate member quotas.', 'Supply equivalent compute capacity under an agreed service contract.', 'Unused commitments may still be billed; capacity and hardware suitability need verification.'],
      ['Service continuity', 'Set workload, security and recovery requirements; oversee provider performance.', 'Deliver contracted power, cooling, connectivity and recovery arrangements.', 'Availability, incident response and remedies depend on verified contract terms.'],
    ],
    demand: 'Who pays for unused minimum lease commitments when member demand falls?',
    details: [
      ['Building, power & cooling', 'Provider responsibility within the contracted service; no consortium-owned facility is assumed.'],
      ['GPU fleet', 'Provider-supplied compute; hardware equivalence, capacity and refresh terms require agreement.'],
      ['Network', 'Provider connectivity and member access requirements must be agreed; verify resilience and service boundaries.'],
      ['Operations', 'Consortium controls member allocation and access policies; provider operates the contracted platform.'],
      ['Backup power', 'Provider resilience, fuel autonomy and recovery must be verified against the same workload requirements.'],
    ],
  },
  hybrid: {
    name: 'Phased hybrid',
    rows: [
      ['Facility & equipment', 'Own and fund the built share of the facility and GPU fleet.', 'Construct and maintain the owned facility; supply additional leased compute.', 'The owned share brings upfront capital and refresh costs; the leased share brings commitments.'],
      ['Compute supply', 'Forecast demand and allocate work across owned and leased capacity.', 'Supply the contracted residual compute requirement.', 'Both idle owned assets and unused lease commitments can raise unit costs.'],
      ['Service continuity', 'Set common security and service requirements across both environments.', 'Support the owned facility and deliver the contracted leased service.', 'Recovery and data access must work across both environments; responsibilities need explicit boundaries.'],
    ],
    demand: 'How will members share idle owned capacity costs and unused lease commitments?',
    details: [
      ['Building, power & cooling', 'Consortium owns the built share; construction and specialist maintenance contracted. Provider handles the leased share.'],
      ['GPU fleet', 'Consortium purchases or finances the owned share; a provider supplies residual compute. Member-contributed hardware is not assumed.'],
      ['Network', 'Consortium manages its internal network and access policies; carrier diversity and connectivity to leased compute require verification.'],
      ['Operations', 'Consortium allocates workloads and oversees security across both environments; specialist support and staffing remain to agree.'],
      ['Backup power', 'Consortium owns backup equipment for its facility and contracts fuel and maintenance; provider resilience must be verified separately.'],
    ],
  },
};

export default function OwnershipRisk({route,children}: {route: Route;children?:ReactNode}) {
  const current = cases[route];
  return <section className="mini-card ownership-risk">
    <span className="eyebrow">Ownership & responsibility</span>
    <h2>Who owns what—and who carries the risk?</h2>
    <p><b>Selected alternative: {current.name}.</b> Proposed arrangements, subject to member and supplier agreement.</p>
    <div className="table-scroll"><table>
      <thead><tr><th>Key decision</th><th>Consortium responsibility</th><th>Contracted provision</th><th>Cost & risk implication</th></tr></thead>
      <tbody>{current.rows.map(([topic, own, contract, impact]) => <tr key={topic}><th>{topic}</th><td>{own}</td><td>{contract}</td><td>{impact}</td></tr>)}</tbody>
    </table></div>
    <div className="ownership-open">
      <h3>Agree before committing funds</h3>
      <div className="minimal-three">
        <article><h4>Demand falls</h4><p>{current.demand}</p></article>
        <article><h4>Service is interrupted</h4><p>What response, recovery and supply obligations will providers commit to, and who covers the remaining exposure?</p></article>
        <article><h4>A member leaves</h4><p>Who covers that member’s share of outstanding {route === 'lease' ? 'lease commitments' : route === 'build' ? 'investment obligations' : 'investment and lease commitments'}?</p></article>
      </div>
    </div>
    {children}
    <details key={route}><summary>View equipment and service responsibilities</summary>
      <dl>{current.details.map(([topic, detail]) => <div key={topic}><dt>{topic}</dt><dd>{detail}</dd></div>)}</dl>
    </details>
  </section>;
}
