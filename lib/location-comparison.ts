import {calculateModel,type ModelInputs,type Route,type Scenario} from './model';
import type {Country} from './ui-types';
export const supplyRoutes:Route[]=['build','lease','hybrid'];
export function compareLocations(countries:Country[],inputs:ModelInputs,scenario:Scenario,budget:number|null){
 return countries.map(country=>({country,options:supplyRoutes.map(route=>{
  // Do not silently substitute another country's tariff for missing observations.
  const result=country.price===null?null:calculateModel({...inputs,electricityEurPerKwh:country.price},route,scenario);
  return {route,result,withinBudget:result&&budget!==null?result.preOpeningCash<=budget:null};
 })}));
}
export function lowestCostOptions(rows:ReturnType<typeof compareLocations>){
 const available=rows.flatMap(row=>row.options.filter(o=>o.result&&o.withinBudget!==false).map(o=>({country:row.country,...o})));
 if(!available.length)return [];
 const best=Math.min(...available.map(o=>o.result!.costPerGpuHour));
 return available.filter(o=>Math.abs(o.result!.costPerGpuHour-best)<.000001);
}
