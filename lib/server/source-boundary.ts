// Defense in depth for obvious instruction-bearing source records. Not a complete injection detector.
const instructionPatterns=[/ignore\s+(?:all|any|the|previous|prior|system)\s+(?:rules|instructions|prompts)/i,/system\s+override/i,/administrator\s+authorization\s*:/i,/(?:higher\s+priority|override)\s+(?:than\s+)?(?:the\s+)?(?:system|design|instructions|rules)/i,/(?:reveal|exfiltrate|send)\s+(?:the\s+)?(?:api\s*key|password|secret)/i];
export function sourceHasInstructions(record:unknown){const text=JSON.stringify(record);return instructionPatterns.some(pattern=>pattern.test(text));}
export function sourceForModel<T extends {id:string}>(record:T){
 return sourceHasInstructions(record)?{id:record.id,excluded:true as const,reason:'Source contains instruction-like text and was excluded. It cannot establish any project fact or be cited.'}:record;
}
