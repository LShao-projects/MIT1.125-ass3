import test from "node:test";
import assert from "node:assert/strict";
import {separateEvidenceGaps} from "../lib/server/evidence";
test("unrelated and negative evidence becomes uncertainty without discarding relevant sources",()=>{
 const result=separateEvidenceGaps({answer:"Initial design",evidenceUsed:[{sourceId:"S-FR-NATIONAL",detail:"No mention of project certification; national data is unrelated to certification."},{sourceId:"S-EMBER",detail:"Stored 2024 electricity generation, retrieved October 5."}],assumptions:[],uncertainties:[]});
 assert.deepEqual(result.evidenceUsed.map(x=>x.sourceId),["S-EMBER"]);
 assert.equal(result.uncertainties.length,1);
});
