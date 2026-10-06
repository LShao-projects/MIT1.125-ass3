import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommendationEvidence} from '../lib/recommendation';
import seed from '../data/seed.json';
import type {Country} from '../lib/ui-types';
const countries=seed.countries as Country[];
test('France-first screen discloses Swedish carbon advantage and a small electricity premium',()=>{const r=recommendationEvidence(countries,219);assert.equal(r.supported,true);assert.ok(Math.abs(r.swedenPremium!-657000)<.001);assert.ok(r.se!.carbonIntensity!<r.fr!.carbonIntensity!);});
test('missing or incomparable observations never support a fixed recommendation',()=>{for(const patch of [{price:null},{carbonIntensity:null},{pricePeriod:'different'},{energyYear:2023}])assert.equal(recommendationEvidence(countries.map(c=>c.code==='FR'?{...c,...patch}:c),219).supported,false);assert.equal(recommendationEvidence(countries.filter(c=>c.code!=='SE'),219).supported,false);});
test('new Swedish cost advantage requires review instead of silently retaining the winner',()=>{assert.equal(recommendationEvidence(countries.map(c=>c.code==='SE'?{...c,price:.05}:c),219).supported,false);});
