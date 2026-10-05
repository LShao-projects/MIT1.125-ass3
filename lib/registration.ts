import {z} from 'zod';
export const RULES_VERSION='2026-10-05';
export const registrationSchema=z.object({name:z.string().trim().min(1).max(100),courseSection:z.string().trim().min(1).max(100),team:z.string().trim().min(1).max(100),agreeToRules:z.literal(true)}).strict();
export function registrationComplete(row:{courseSection?:string|null;team?:string|null;rulesAcceptedAt?:string|null;rulesVersion?:string|null}|undefined|null){return !!(row?.courseSection?.trim()&&row.team?.trim()&&row.rulesAcceptedAt&&row.rulesVersion===RULES_VERSION)}
