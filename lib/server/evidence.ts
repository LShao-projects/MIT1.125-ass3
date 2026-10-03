export function validGroundedAnswer(value: unknown, allowedSourceIds: ReadonlySet<string>): value is { answer: string; citations: string[] } {
  if (!value || typeof value !== "object") return false;
  const v = value as { answer?: unknown; citations?: unknown };
  if (typeof v.answer !== "string" || !v.answer.trim() || v.answer.length > 5000 || !Array.isArray(v.citations)) return false;
  if (v.citations.some(id => typeof id !== "string" || !allowedSourceIds.has(id))) return false;
  return v.citations.length > 0 || /insufficient|unavailable|cannot determine|lack (?:of )?evidence|not enough evidence/i.test(v.answer);
}
