export function validGroundedAnswer(value: unknown, allowedSourceIds: ReadonlySet<string>): value is { answer: string; citations: string[] } {
  if (!value || typeof value !== "object") return false;
  const v = value as { answer?: unknown; citations?: unknown };
  if (typeof v.answer !== "string" || !v.answer.trim() || v.answer.length > 5000 || !Array.isArray(v.citations)) return false;
  if (v.citations.some(id => typeof id !== "string" || !allowedSourceIds.has(id))) return false;
  return v.citations.length > 0 || /insufficient|unavailable|cannot determine|lack (?:of )?evidence|not enough evidence/i.test(v.answer);
}

export type HalfUtilizationFacts={caseLabel:string;routeLabel:string;itLoadMw:number;pue:number;facilityPowerMw:number;installedGpus:number;baseProductiveGpuHours:number;halfProductiveGpuHours:number;baseCostPerGpuHour:number;halfCostPerGpuHour:number;demandScreenItMw?:number;demandScreenFacilityMw?:number};
const readableNumber=(value:number,maximumFractionDigits=2)=>value.toLocaleString("en-US",{maximumFractionDigits});
export function buildHalfUtilizationText(facts:HalfUtilizationFacts){
  const demandScreen=facts.demandScreenItMw===undefined||facts.demandScreenFacilityMw===undefined?"":` The separate demand-derived sizing screen remains ${readableNumber(facts.demandScreenItMw)} MW IT / ${readableNumber(facts.demandScreenFacilityMw)} MW facility; it is not created by the half-utilization stress case.`;
  return `Answer\n\nUnder the half forecast-utilization stress case, the installed ${facts.caseLabel} remains ${readableNumber(facts.installedGpus)} GPU equivalents, ${readableNumber(facts.itLoadMw)} MW IT and ${readableNumber(facts.facilityPowerMw)} MW facility capacity at PUE ${readableNumber(facts.pue)}. Productive GPU-hours fall from ${readableNumber(facts.baseProductiveGpuHours,0)} to ${readableNumber(facts.halfProductiveGpuHours,0)}, while the installed fleet and capital remain fixed. For ${facts.routeLabel}, modeled cost per productive GPU-hour therefore changes from €${facts.baseCostPerGpuHour.toFixed(2)} to €${facts.halfCostPerGpuHour.toFixed(2)}.${demandScreen}\n\nEvidence used\n\n- [S-CALC] Deterministic base and half-utilization scenario calculations; the half case keeps the installed fleet and capital fixed while halving productive GPU-hours.\n\nAssumptions\n\n- Installed capacity is ${readableNumber(facts.itLoadMw)} MW IT at PUE ${readableNumber(facts.pue)}.\n- The half forecast-utilization stress case applies 50% of base productive utilization without resizing the installed fleet.\n\nUncertainty\n\n- Actual future utilization is not established by signed member commitments.\n- Operating electricity may fall at lower utilization, but not exactly in proportion because the model retains an idle-power floor and applicable lease minimums.\n- A smaller facility would require a separate sizing decision supported by revised annual demand and peak-capacity evidence.`;
}

export type StructuredGroundedAnswer={answer:string;evidenceUsed:Array<{sourceId:string;detail:string}>;assumptions:string[];uncertainties:string[]};
export function validStructuredGroundedAnswer(value:unknown,allowedSourceIds:ReadonlySet<string>):value is StructuredGroundedAnswer{
  if(!value||typeof value!=="object")return false;
  const v=value as Partial<StructuredGroundedAnswer>;
  if(typeof v.answer!=="string"||!v.answer.trim()||v.answer.length>3000||!Array.isArray(v.evidenceUsed)||!Array.isArray(v.assumptions)||!Array.isArray(v.uncertainties))return false;
  if(v.evidenceUsed.length>8||v.assumptions.length>8||v.uncertainties.length>8)return false;
  if(v.evidenceUsed.some(item=>!item||typeof item.sourceId!=="string"||!allowedSourceIds.has(item.sourceId)||typeof item.detail!=="string"||!item.detail.trim()))return false;
  if([...v.assumptions,...v.uncertainties].some(item=>typeof item!=="string"||!item.trim()))return false;
  return v.evidenceUsed.length>0||v.uncertainties.length>0;
}
export function formatStructuredGroundedAnswer(value:StructuredGroundedAnswer){
  const evidence=value.evidenceUsed.length?value.evidenceUsed.map(item=>`- [${item.sourceId}] ${item.detail}`).join("\n"):"- No supporting source record was available.";
  const assumptions=value.assumptions.length?value.assumptions.map(item=>`- ${item}`).join("\n"):"- None identified.";
  const uncertainty=value.uncertainties.length?value.uncertainties.map(item=>`- ${item}`).join("\n"):"- No additional uncertainty identified.";
  return `Answer\n\n${value.answer.trim()}\n\nEvidence used\n\n${evidence}\n\nAssumptions\n\n${assumptions}\n\nUncertainty\n\n${uncertainty}`;
}
