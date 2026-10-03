export type Country = {
  code: string; iso3: string; name: string; price: number | null; priceStatus: string;
  priceRetrievedAt?: string; energyRetrievedAt?: string; pricePeriod: string; energyYear: number; generationTwh: number | null;
  demandTwh: number | null; renewableShare: number | null; carbonIntensity: number | null;
  mix: { nuclear: number; renewables: number; fossil: number };
  dcRecords: number; clusterRecords: number; priority: boolean | string | number;
};
export type Source = {id:string; title:string; publisher:string; url:string; period:string; type:string; verificationStatus:string; notes:string; [key:string]:unknown};
export type Dataset = {countries:Country[]; sources:Source[]; cases:Record<string,unknown>[]; verifications?:Record<string,unknown>[]; refreshes?:Record<string,unknown>[]};
export type Session = {user:{userId:string;displayName:string;email:string}|null;registered:boolean;role:string|null;openaiConfigured:boolean;emberConfigured:boolean;usage:unknown;localPreview:boolean};
