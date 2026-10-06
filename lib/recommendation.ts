import type {Country} from './ui-types';
/** Transparent committee judgment: cost first among the two low-carbon candidates.
 * This is a national screen, not a site feasibility score or a provider quote. */
export function recommendationEvidence(countries:Country[],annualEnergyGwh:number){
 const fr=countries.find(c=>c.code==='FR'),de=countries.find(c=>c.code==='DE'),se=countries.find(c=>c.code==='SE');
 const complete=!!fr&&!!de&&!!se&&[fr,de,se].every(c=>c.price!==null&&Number.isFinite(c.price)&&c.carbonIntensity!==null&&Number.isFinite(c.carbonIntensity))&&new Set([fr,de,se].map(c=>c.pricePeriod)).size===1&&new Set([fr,de,se].map(c=>c.energyYear)).size===1;
 const supported=complete&&fr!.price!<se!.price!&&fr!.price!<de!.price!&&fr!.carbonIntensity!<de!.carbonIntensity!&&se!.carbonIntensity!<fr!.carbonIntensity!;
 return {fr,de,se,supported,annualEnergyGwh,swedenPremium:complete?(se!.price!-fr!.price!)*annualEnergyGwh*1e6:null,germanyPremium:complete?(de!.price!-fr!.price!)*annualEnergyGwh*1e6:null};
}
