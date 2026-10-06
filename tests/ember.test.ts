import test from 'node:test';
import assert from 'node:assert/strict';
import {queryEmber,mergeEmber} from '../lib/server/ember';
test('failed demand preserves old value and date while generation and carbon update',async()=>{
 const fake:typeof fetch=async input=>{
  const url=String(input);
  if(url.includes('electricity-demand'))return new Response('',{status:500});
  const data={entity_code:'FRA',date:'2024',is_aggregate_entity:false,series:'Total generation',generation_twh:564.49,emissions_intensity_gco2_per_kwh:40.34};
  return Response.json({data:[data]});
 };
 const live=await queryEmber('test-key','FRA',2024,fake);
 const merged=mergeEmber({generationTwh:500,demandTwh:449,carbonIntensity:45,energyYear:2024,energyRetrievedAt:'2026-10-01'},live);
 assert.equal(merged.metrics.generationTwh.value,564.49);
 assert.equal(merged.metrics.carbonIntensity.status,'live');
 assert.equal(merged.metrics.demandTwh.value,449);
 assert.equal(merged.metrics.demandTwh.status,'stored');
 assert.equal(merged.metrics.demandTwh.retrievedAt,'2026-10-01');
 assert.equal(merged.metrics.demandTwh.error,'Ember HTTP 500');
 const again=mergeEmber({generationTwh:564.49,demandTwh:449,carbonIntensity:40.34,energyYear:2024,energyRetrievedAt:'2026-10-02',energyMetrics:merged.metrics},live);
 assert.equal(again.metrics.demandTwh.retrievedAt,'2026-10-01');
 const wrongYear=mergeEmber({generationTwh:1,demandTwh:2,carbonIntensity:3,energyYear:2023,energyRetrievedAt:'old'},live);
 assert.equal(wrongYear.metrics.demandTwh.value,null);
});
test('unavailable provider never overwrites stored values with null',async()=>{
 const live=await queryEmber('test','FRA',2024,async()=>new Response('',{status:503}));
 const result=mergeEmber({generationTwh:1,demandTwh:2,carbonIntensity:3,energyYear:2024,energyRetrievedAt:'old'},live);
 assert.deepEqual(Object.values(result.metrics).map(x=>x.value),[1,2,3]);
});

const monthlyRows=()=>Array.from({length:12},(_,i)=>({entity_code:'FRA',date:`2024-${String(i+1).padStart(2,'0')}-01`,is_aggregate_entity:false,demand_twh:10+i}));
test('yearly demand 500 falls back to twelve monthly observations with explicit provenance',async()=>{
 const calls:string[]=[];
 const fake:typeof fetch=async input=>{const url=String(input);calls.push(url);if(url.includes('electricity-demand/yearly'))return new Response('',{status:500});if(url.includes('electricity-demand/monthly'))return Response.json({data:monthlyRows()});return Response.json({data:[{entity_code:'FRA',date:'2024',series:'Total generation',generation_twh:500,emissions_intensity_gco2_per_kwh:40}]});};
 const result=await queryEmber('do-not-log','FRA',2024,fake);
 assert.equal(result.metrics.demandTwh.value,186);assert.equal(result.metrics.demandTwh.method,'monthly_sum');assert.equal(result.metrics.demandTwh.status,'live');
 assert.match(result.metrics.demandTwh.note!,/12 monthly/);assert.doesNotMatch(JSON.stringify(result),/do-not-log|api_key/);assert.equal(calls.length,4);
 const again=mergeEmber({generationTwh:500,demandTwh:186,carbonIntensity:40,energyYear:2024,energyRetrievedAt:'old',energyMetrics:result.metrics},await queryEmber('x','FRA',2024,async()=>new Response('',{status:500})));
 assert.equal(again.metrics.demandTwh.method,'monthly_sum');assert.equal(again.metrics.demandTwh.retrievedAt,result.metrics.demandTwh.retrievedAt);assert.equal(again.metrics.demandTwh.status,'stored');
});
test('monthly demand aggregation rejects missing, duplicate, foreign-year and invalid observations',async()=>{
 const {parseEmberMonthlyDemand}=await import('../lib/server/parsers');const rows=monthlyRows();
 assert.equal(parseEmberMonthlyDemand({data:rows},2024,'FRA'),186);
 for(const data of [rows.slice(1),[...rows,rows[0]],rows.map(r=>({...r,entity_code:'DEU'})),rows.map(r=>({...r,date:r.date.replace('2024','2023')})),rows.map((r,i)=>i? r:{...r,demand_twh:null}),rows.map((r,i)=>i?r:{...r,demand_twh:-1}),rows.map((r,i)=>i?r:{...r,is_aggregate_entity:true})])assert.throws(()=>parseEmberMonthlyDemand({data},2024,'FRA'));
});
test('an incomplete monthly fallback preserves the stored annual value and date',async()=>{
 const live=await queryEmber('x','FRA',2024,async input=>String(input).includes('/monthly')?Response.json({data:monthlyRows().slice(1)}):new Response('',{status:500}));
 const result=mergeEmber({generationTwh:500,demandTwh:449,carbonIntensity:40,energyYear:2024,energyRetrievedAt:'original'},live);
 assert.equal(result.metrics.demandTwh.value,449);assert.equal(result.metrics.demandTwh.status,'stored');assert.equal(result.metrics.demandTwh.retrievedAt,'original');
});
test('annual success and authentication errors do not invoke the monthly fallback',async()=>{
 for(const status of [200,403]){let calls=0;const result=await queryEmber('x','FRA',2024,async input=>{calls++;assert.doesNotMatch(String(input),/monthly/);return status===403?new Response('',{status}):Response.json({data:[{entity_code:'FRA',date:'2024',series:'Total generation',generation_twh:500,demand_twh:449,emissions_intensity_gco2_per_kwh:40}]});});assert.equal(calls,3);assert.equal(result.metrics.demandTwh.status,status===200?'live':'unavailable');}
});
