export function validGroundedAnswer(value: unknown, allowedSourceIds: ReadonlySet<string>): value is { answer: string; citations: string[] } {
  if (!value || typeof value !== "object") return false;
  const v = value as { answer?: unknown; citations?: unknown };
  if (typeof v.answer !== "string" || !v.answer.trim() || v.answer.length > 5000 || !Array.isArray(v.citations)) return false;
  if (v.citations.some(id => typeof id !== "string" || !allowedSourceIds.has(id))) return false;
  return v.citations.length > 0 || /insufficient|unavailable|cannot determine|lack (?:of )?evidence|not enough evidence/i.test(v.answer);
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
