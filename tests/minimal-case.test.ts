import {test} from 'node:test';
import assert from 'node:assert/strict';
import {caseDefaults,evaluateCase} from '../lib/minimal-case';
test('case demand drives identical productive output for all base alternatives',()=>{const c=evaluateCase(caseDefaults,.0614);for(const r of c.results.filter(r=>r.scenario==='base'))assert.equal(r.capacity.annualDemandGpuHours,caseDefaults.annualHours);assert.equal(c.requiredGpus,5000);assert.equal(c.requiredMw,12.5)});
test('lower demand retains facility investment in the fixed proposal',()=>{const a=evaluateCase(caseDefaults,.0614),b=evaluateCase({...caseDefaults,annualHours:14000000},.0614);assert.equal(a.results[0].preOpeningCash,b.results[0].preOpeningCash);assert.equal(b.results[0].capacity.annualDemandGpuHours,14000000);assert.equal(b.results[2].capacity.annualDemandGpuHours,7000000)});
test('scheduling ceiling affects required capacity without inventing annual demand',()=>{const c=evaluateCase({...caseDefaults,utilization:.2},.0614);assert.equal(c.capacityFits,false);assert.equal(c.results[0].capacity.annualDemandGpuHours,28000000)});
