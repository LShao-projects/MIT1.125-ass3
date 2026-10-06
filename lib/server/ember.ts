import {parseEmberMetric,parseEmberMonthlyDemand} from './parsers';
export const emberFields=['generationTwh','demandTwh','carbonIntensity'] as const;
export type EmberField=typeof emberFields[number];
export type EmberObservation={value:number|null;status:'live'|'stored'|'unavailable';retrievedAt:string|null;error?:string;method?:'yearly'|'monthly_sum';sourceUrl?:string;note?:string};
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
   if(!response.ok){
    // The yearly demand endpoint can fail while the documented monthly endpoint works.
    // Use a complete twelve-month series only, and expose its different provenance.
    if(field==='demandTwh'&&response.status>=500){
     try{
      const monthly=new URL('https://api.ember-energy.org/v1/electricity-demand/monthly');
      for(const [k,v] of Object.entries({entity_code:iso3,start_date:`${year}-01`,end_date:`${year}-12`,api_key:key}))monthly.searchParams.set(k,v);
      const fallback=await request(monthly,{signal:AbortSignal.timeout(18000)});
      if(fallback.ok){const value=parseEmberMonthlyDemand(await fallback.json(),year,iso3);monthly.searchParams.delete('api_key');
       return [field,{value,status:'live',retrievedAt:new Date().toISOString(),method:'monthly_sum',sourceUrl:monthly.href,note:`Yearly endpoint returned HTTP ${response.status}. Sum of 12 monthly demand values; may differ from the separately revised yearly series.`}] as const;}
     }catch{/* Keep the stored annual observation if the monthly series is incomplete or unavailable. */}
    }
    return [field,{value:null,status:'unavailable',retrievedAt:null,error:`Ember HTTP ${response.status}`}] as const;
   }
   const value=parseEmberMetric(await response.json(),metric,year,iso3);
   return [field,{value,status:'live',retrievedAt:new Date().toISOString(),method:'yearly'}] as const;
  }catch(error){return [field,{value:null,status:'unavailable',retrievedAt:null,error:error instanceof Error&&/timeout|abort/i.test(error.name)?'Ember request timed out':'Ember response unavailable or invalid'}] as const;}
 }));
 return {energyYear:year,metrics:Object.fromEntries(entries) as EmberObservations};
}
export function mergeEmber(snapshot:{generationTwh:number|null;demandTwh:number|null;carbonIntensity:number|null;energyYear:number|null;energyRetrievedAt:string|null;energyMetrics?:EmberObservations|null},live:EmberResult):EmberResult{
 const metrics=Object.fromEntries(emberFields.map(field=>{
  const observation=live.metrics[field];
  if(observation.status==='live')return [field,observation];
  const value=snapshot.energyYear===live.energyYear?snapshot[field]:null;
  return [field,{...(value===null?{}:snapshot.energyMetrics?.[field]),...observation,value,status:value===null?'unavailable':'stored',retrievedAt:value===null?null:snapshot.energyMetrics?.[field]?.retrievedAt??snapshot.energyRetrievedAt}];
 })) as EmberObservations;
 return {...live,metrics};
}
