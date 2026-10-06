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
