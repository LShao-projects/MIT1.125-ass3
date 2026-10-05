import { z } from 'zod';

export const summaryAnalysisSchema = z.object({
  recommendation: z.string().trim().min(1).max(700),
  reasons: z.array(z.string().trim().min(1).max(500)).length(3),
  uncertainties: z.array(z.string().trim().min(1).max(500)).length(3),
  citations: z.array(z.string()).min(1).max(8),
}).strict();
export type SummaryAnalysis = z.infer<typeof summaryAnalysisSchema>;
export const summaryFormat = {
  type: 'json_schema', name: 'summary_analysis', strict: true,
  schema: { type: 'object', additionalProperties: false, properties: {
    recommendation: { type: 'string' },
    reasons: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    uncertainties: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    citations: { type: 'array', items: { type: 'string' } },
  }, required: ['recommendation', 'reasons', 'uncertainties', 'citations'] },
};
export function validSummaryAnalysis(value: unknown, allowed: ReadonlySet<string>): value is SummaryAnalysis {
  const parsed = summaryAnalysisSchema.safeParse(value);
  return parsed.success && parsed.data.citations.every(id => allowed.has(id));
}
