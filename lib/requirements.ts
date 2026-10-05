import {z} from 'zod';
export const requirementSchema=z.object({annualHours:z.number().finite().nonnegative().max(1e12).nullable(),peakGpus:z.number().finite().nonnegative().max(1e7).nullable(),workload:z.string().max(1500),deadline:z.string().max(100),evidence:z.string().max(1500)}).strict();
export type Requirements=z.infer<typeof requirementSchema>;
export const emptyRequirements:Requirements={annualHours:null,peakGpus:null,workload:'Research training, experiments, teaching and inference. Member forecasts remain unverified.',deadline:'Not confirmed',evidence:''};
export function demandCapacity(r:Requirements,utilization:number,yieldRate:number,kw:number,pue:number){if(r.annualHours===null||r.peakGpus===null)return null;const gpus=Math.ceil(Math.max(r.annualHours/(8760*utilization*yieldRate),r.peakGpus));return {gpus,itMw:gpus*kw/1000,facilityMw:gpus*kw*pue/1000};}
