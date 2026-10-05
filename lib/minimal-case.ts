import {defaultInputs,runScenarios,validateInputs,type ModelInputs} from './model';
export const caseDefaults={annualHours:28_000_000,peakGpus:5000,utilization:.7,pue:1.25};
export type CaseControls=typeof caseDefaults;
export function evaluateCase(c:CaseControls,tariff:number,base:ModelInputs=defaultInputs){
 if(!Object.values(c).every(Number.isFinite)||c.annualHours<1_000_000||c.annualHours>87_600_000||c.peakGpus<1||c.peakGpus>10000||!Number.isInteger(c.peakGpus)||c.utilization<.1||c.utilization>1||c.pue<1||c.pue>2)throw new RangeError('Outside case sensitivity range');
 const requiredGpus=Math.ceil(Math.max(c.peakGpus,c.annualHours/(8760*c.utilization)));
 const requiredItMw=requiredGpus*base.gpuAllocatedItKw/1000;
 // Size once from base demand. Stress cases keep this fleet and its capital fixed.
 const inputs=validateInputs({...base,itMw:requiredItMw,pue:c.pue,productiveYield:1,utilization:c.annualHours/(requiredGpus*8760),electricityEurPerKwh:tariff});
 const requiredMw=requiredItMw*c.pue;
 const results=runScenarios(inputs);
 const best=results.filter(r=>r.scenario==='base').sort((a,b)=>a.costPerGpuHour-b.costPerGpuHour)[0];
 // The course reference remains exactly 20 MW IT × 1.25 PUE = 25 MW.
 const referenceGpus=20000/base.gpuAllocatedItKw;
 const referenceUtilization=c.annualHours/(referenceGpus*8760);
 const referenceResults=referenceUtilization>=.01&&referenceUtilization<=1?runScenarios({...inputs,itMw:20,pue:1.25,utilization:referenceUtilization}):null;
 return {inputs,requiredGpus,requiredItMw,requiredMw,results,best,referenceGpus,referenceResults,capacityFits:requiredGpus<=referenceGpus,baselineMw:25};
}

/** Committee review keeps the original proposal fixed; demand-sizing is a revision only. */
export function evaluateCommitteeCase(c:CaseControls,tariff:number,base:ModelInputs=defaultInputs){
 const demand=evaluateCase(c,tariff,base);
 const inputs=validateInputs({...demand.inputs,itMw:20,pue:c.pue,utilization:c.annualHours/(demand.referenceGpus*8760)});
 const results=runScenarios(inputs);
 return {...demand,inputs,results,best:results.filter(r=>r.scenario==='base').sort((a,b)=>a.costPerGpuHour-b.costPerGpuHour)[0]};
}
