import {defaultInputs,calculateModel,type ModelInputs,type Route} from './model';
export const caseDefaults={annualHours:28_000_000,peakGpus:5000,utilization:.7,pue:1.25};
export type CaseControls=typeof caseDefaults;
export function evaluateCase(c:CaseControls,tariff:number,base:ModelInputs=defaultInputs){
 if(!Object.values(c).every(Number.isFinite)||c.annualHours<=0||c.annualHours>87_600_000||c.peakGpus<1||c.peakGpus>10000||c.utilization<.1||c.utilization>1||c.pue<1||c.pue>2)throw new RangeError('Outside case sensitivity range');
 const requiredGpus=Math.ceil(Math.max(c.peakGpus,c.annualHours/(8760*c.utilization)));
 // Fixed 20 MW proposal is evaluated at the requested annual productive output.
 // Utilization in the capacity check is a scheduling ceiling, not a second demand multiplier.
 const fleet=20000/base.gpuAllocatedItKw;
 const inputs={...base,itMw:20,pue:c.pue,productiveYield:1,utilization:c.annualHours/(fleet*8760),electricityEurPerKwh:tariff};
 const requiredMw=requiredGpus*base.gpuAllocatedItKw*c.pue/1000;
 const results=(['build','lease','hybrid'] as const).flatMap(r=>(['base','delay','half'] as const).map(s=>calculateModel(inputs,r,s)));
 const best=results.filter(r=>r.scenario==='base').sort((a,b)=>a.costPerGpuHour-b.costPerGpuHour)[0];
 return {inputs,requiredGpus,requiredMw,results,best,capacityFits:requiredGpus<=fleet,baselineMw:20*c.pue};
}
