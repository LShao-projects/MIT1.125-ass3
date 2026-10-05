import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demandCapacity,emptyRequirements} from '../lib/requirements';
test('unknown member demand does not become zero capacity',()=>assert.equal(demandCapacity(emptyRequirements,.7,.9,2,1.25),null));
test('fleet respects peak even when annual average is low',()=>{const r=demandCapacity({...emptyRequirements,annualHours:8760,peakGpus:1000},.5,1,2,1.25)!;assert.equal(r.gpus,1000);assert.equal(r.facilityMw,2.5)});
test('annual requirement includes productive yield once',()=>{const r=demandCapacity({...emptyRequirements,annualHours:876000,peakGpus:1},.5,.8,2,1.25)!;assert.equal(r.gpus,250);assert.equal(r.itMw,.5)});
