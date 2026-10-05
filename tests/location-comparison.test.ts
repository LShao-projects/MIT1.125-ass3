import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareLocations,lowestCostOptions} from '../lib/location-comparison';
import {defaultInputs} from '../lib/model';
import seed from '../data/seed.json';
import type {Country} from '../lib/ui-types';
const countries=(seed.countries as Country[]).filter(c=>['DE','FR','SE'].includes(c.code));
test('location screen substitutes tariffs while preserving equivalent workload',()=>{
 const rows=compareLocations(countries,defaultInputs,'base',null);
 assert.equal(rows.length,3);
 assert.equal(new Set(rows.flatMap(r=>r.options.map(o=>o.result!.capacity.annualDemandGpuHours))).size,1);
 const de=rows.find(r=>r.country.code==='DE')!,fr=rows.find(r=>r.country.code==='FR')!;
 assert.ok(de.options[0].result!.totalCost>fr.options[0].result!.totalCost);
 assert.equal(de.options[1].result!.totalCost,fr.options[1].result!.totalCost);
});
test('missing prices never borrow the planning tariff',()=>{
 const rows=compareLocations([{...countries[0],price:null}],defaultInputs,'base',null);
 assert.ok(rows[0].options.every(o=>o.result===null));assert.deepEqual(lowestCostOptions(rows),[]);
});
test('zero opening budget excludes capital-intensive plans and preserves lease ties',()=>{
 const rows=compareLocations(countries,defaultInputs,'base',0);
 assert.ok(rows.every(r=>r.options[0].withinBudget===false));
 const best=lowestCostOptions(rows);assert.equal(best.length,3);assert.ok(best.every(x=>x.route==='lease'));
});
test('updated demand and selected stress feed every candidate',()=>{
 const rows=compareLocations(countries,{...defaultInputs,itMw:10},'half',null);
 const base=compareLocations(countries,defaultInputs,'base',null);
 assert.equal(rows[0].options[0].result!.capacity.annualDemandGpuHours,base[0].options[0].result!.capacity.annualDemandGpuHours/4);
 assert.ok(rows.every(r=>r.options.every(o=>o.result!.scenario==='half')));
});
