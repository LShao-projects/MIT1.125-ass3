'use client';
import { z } from 'zod';
import { useEffect, useState, type ReactNode } from 'react';
import type { ModelInputs, Route, Scenario } from '@/lib/model';
import type { CaseControls } from '@/lib/minimal-case';
import type { Dataset, Session } from '@/lib/ui-types';
import { summaryAnalysisSchema, type SummaryAnalysis } from '@/lib/summary-analysis';

type Result = { analysis: SummaryAnalysis; citations: { id: string; title: string; url: string }[]; generatedAt: string };
// Memory only: never share a user's analysis across accounts or persist it in browser storage.
const cache = new Map<string, { result: Result; expires: number }>();
const pending = new Map<string, Promise<Result>>();
const labels = { build: 'Build & own', lease: 'Lease compute', hybrid: 'Phased hybrid', base: 'Base case', delay: 'Grid delayed one year', half: 'Half forecast utilization' };
async function generate(key: string, payload: string): Promise<Result> {
  const existing = pending.get(key);
  if (existing) return existing;
  const request = (async () => {
    const response = await fetch('/api/adviser', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, signal: AbortSignal.timeout(65000) });
    const raw: unknown = await response.json();
    if (!response.ok) {
      const error = z.object({error: z.string()}).safeParse(raw);
      throw new Error(error.success ? error.data.error : 'Analysis unavailable. Try again.');
    }
    const result = z.object({analysis: summaryAnalysisSchema, citations: z.array(z.object({id:z.string(),title:z.string(),url:z.string()})), generatedAt:z.string().datetime()}).parse(raw);
    const analysis = result.analysis;
    if (!Array.isArray(result.citations) || analysis.citations.some(id => !result.citations.some((c: {id: string}) => c.id === id))) throw new Error('Analysis sources could not be verified.');
    const validated = { ...result, analysis } as Result;
    if (cache.size >= 20) cache.delete(cache.keys().next().value!);
    cache.set(key, { result: validated, expires: Date.now() + 10 * 60_000 });
    return validated;
  })();
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
export default function SummaryAnalysisPanel({ inputs, controls, route, scenario, data, session, ready, countryCode, openingBudget, onAccount, onSource, children }: {
  inputs: ModelInputs; controls: CaseControls; route: Route; scenario: Scenario; data: Dataset;
  countryCode: string; openingBudget: number | null; session: Session | null; ready: boolean; onAccount: () => void; onSource: (id: string) => void; children: ReactNode;
}) {
  const payload = JSON.stringify({ purpose: 'summary', question: 'Assess the current dashboard filters: recommend a next investment step, give three reasons and three decision-changing uncertainties.',
    countryCodes: ['DE', 'FR', 'SE'], inputs,
    requirements: { annualHours: controls.annualHours, peakGpus: controls.peakGpus, schedulingUtilization: controls.utilization, workload: 'Research, teaching and inference', deadline: 'Unknown', evidence: 'Illustrative case, no signed demand' },
    context: { caseMode: 'personal', page: 'summary', focusedCountry: countryCode, openingBudget, route, scenario },
  });
  const key = JSON.stringify([session?.user?.userId, payload, data]);
  const [state, setState] = useState<{key: string; result?: Result; error?: string}>({key: ''});
  const [retry, setRetry] = useState(0);
  const enabled = !!(ready && session?.registered && session.openaiConfigured);
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    const hit = cache.get(key);
    const timer = setTimeout(() => {
      if (hit && hit.expires > Date.now()) { setState({ key, result: hit.result }); return; }
      setState({ key });
      generate(key, payload).then(result => { if (!disposed) setState({ key, result }); })
        .catch(error => { if (!disposed) setState({ key, error: error instanceof Error ? error.message : 'Analysis unavailable.' }); });
    }, 1200);
    return () => { disposed = true; clearTimeout(timer); };
  }, [key, payload, enabled, retry]);
  // A response for previous filters is never displayed as the current recommendation.
  const current = enabled && state.key === key ? state : null;
  const result = current?.result;
  return <section className="mini-card recommendation" aria-busy={enabled && !result && !current?.error}>
    <span className="eyebrow">05 · Your AI summary</span>
    <p className="caption" role="status">{!session ? 'Checking AI access…' : !session.registered ? 'Model assessment below. Sign in and register for analysis of your current filters.' : !session.openaiConfigured ? 'Model assessment below. AI analysis is not configured.' : !ready ? 'Loading current evidence and assumptions…' : current?.error ? `AI analysis unavailable: ${current.error} Showing the current model assessment.` : result ? `AI analysis · ${labels[route]} · ${labels[scenario]} · ${new Date(result.generatedAt).toLocaleString()}` : 'Analyzing current filters… Current model assessment shown below.'}</p>
    {!session?.registered && session && <button className="button secondary" onClick={onAccount}>Sign in and register</button>}
    {current?.error && <button className="button secondary" onClick={() => setRetry(v => v + 1)}>Retry analysis</button>}
    {result ? <div aria-live="polite"><h2>{result.analysis.recommendation}</h2><div className="minimal-two"><div><h3>Three reasons</h3><ol>{result.analysis.reasons.map((reason, i) => <li key={i}>{reason}</li>)}</ol></div><div><h3>Three largest uncertainties</h3><ol>{result.analysis.uncertainties.map((uncertainty, i) => <li key={i}>{uncertainty}</li>)}</ol></div></div><div className="summary-analysis-sources">{result.citations.map(citation => <button key={citation.id} onClick={() => onSource(citation.id)} title={citation.title}>{citation.id} · {citation.title}</button>)}</div></div> : children}
    <p className="caption">Updates with your requirements and choices. Based on calculations and stored evidence; each new analysis counts toward your daily adviser limit. Initial assessment only.</p>
  </section>;
}
