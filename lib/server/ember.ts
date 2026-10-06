import {parseEmberMetric} from './parsers';
export const emberFields=['generationTwh','demandTwh','carbonIntensity'] as const;
export type EmberField=typeof emberFields[number];
export type EmberObservation={value:number|null;status:'live'|'stored'|'unavailable';retrievedAt:string|null;error?:string};
export type EmberObservations=Record<EmberField,EmberObservation>;
export type EmberResult={energyYear:number;metrics:EmberObservations};
const definitions={generationTwh:['electricity-generation/yearly','generation_twh'],demandTwh:['electricity-demand/yearly','demand_twh'],carbonIntensity:['carbon-intensity/yearly','emissions_intensity_gco2_per_kwh']} as const;
export async function queryEmber(key:string,iso3:string,year=2024,request:typeof fetch=fetch):Promise<EmberResult>{
 const entries=await Promise.all(emberFields.map(async field=>{
  const [path,metric]=definitions[field];
  try{
   const url=new URL(`https://api.ember-energy.org/v1/${path}`);
   for(const [k,v] of Object.entries({entity_code:iso3,start_date:String(year),end_date:String(year),api_key:key}))url.searchParams.set(k,v);
   const response=await request(url,{signal:AbortSignal.timeout(18000)});
   if(!response.ok)return [field,{value:null,status:'unavailable',retrievedAt:null,error:`Ember HTTP ${response.status}`}] as const;
   const value=parseEmberMetric(await response.json(),metric,year,iso3);
   return [field,{value,status:'live',retrievedAt:new Date().toISOString()}] as const;
  }catch(error){return [field,{value:null,status:'unavailable',retrievedAt:null,error:error instanceof Error&&/timeout|abort/i.test(error.name)?'Ember request timed out':'Ember response unavailable or invalid'}] as const;}
 }));
 return {energyYear:year,metrics:Object.fromEntries(entries) as EmberObservations};
}
export function mergeEmber(snapshot:{generationTwh:number|null;demandTwh:number|null;carbonIntensity:number|null;energyYear:number|null;energyRetrievedAt:string|null;energyMetrics?:EmberObservations|null},live:EmberResult):EmberResult{
 const metrics=Object.fromEntries(emberFields.map(field=>{
  const observation=live.metrics[field];
  if(observation.status==='live')return [field,observation];
  const value=snapshot.energyYear===live.energyYear?snapshot[field]:null;
  return [field,{...observation,value,status:value===null?'unavailable':'stored',retrievedAt:value===null?null:snapshot.energyMetrics?.[field]?.retrievedAt??snapshot.energyRetrievedAt}];
 })) as EmberObservations;
 return {...live,metrics};
}
