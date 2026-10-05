import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validSummaryAnalysis } from '../lib/summary-analysis';
const answer = { recommendation: 'Obtain a grid offer before committing capital.', reasons: ['Demand is assumed.', 'Tariff is national.', 'Capacity is uncontracted.'], uncertainties: ['Member demand.', 'Grid date.', 'Supplier bids.'], citations: ['S-CALC'] };
test('dashboard analysis rejects invented citations and malformed sections', () => {
  const allowed = new Set(['S-CALC']);
  assert.equal(validSummaryAnalysis(answer, allowed), true);
  assert.equal(validSummaryAnalysis({...answer, citations:['S-INVENTED']}, allowed), false);
  assert.equal(validSummaryAnalysis({...answer, citations:[]}, allowed), false);
  assert.equal(validSummaryAnalysis({...answer, reasons:['Only one']}, allowed), false);
  assert.equal(validSummaryAnalysis({...answer, recommendation:''}, allowed), false);
});
