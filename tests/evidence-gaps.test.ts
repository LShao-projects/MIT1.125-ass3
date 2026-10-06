import test from "node:test";
import assert from "node:assert/strict";
import {separateEvidenceGaps, structuredAnswerIssue} from "../lib/server/evidence";
test("unrelated and negative evidence becomes uncertainty without discarding relevant sources",()=>{
 const result=separateEvidenceGaps({answer:"Initial design",evidenceUsed:[{sourceId:"S-FR-NATIONAL",detail:"No mention of project certification; national data is unrelated to certification."},{sourceId:"S-EMBER",detail:"Stored 2024 electricity generation, retrieved October 5."}],assumptions:[],uncertainties:[]});
 assert.deepEqual(result.evidenceUsed.map(x=>x.sourceId),["S-EMBER"]);
 assert.equal(result.uncertainties.length,1);
});

test("saved design assumptions require a successful server design read, not an invented source",()=>{
 const answer={answer:"Saved PUE is 1.30.",evidenceUsed:[],assumptions:["PUE 1.30 is the saved design assumption."],uncertainties:[]};
 assert.equal(structuredAnswerIssue(answer,new Set(),false),"missing_support");
 assert.equal(structuredAnswerIssue(answer,new Set(),true),null);
 assert.equal(structuredAnswerIssue({...answer,evidenceUsed:[{sourceId:"S-FAKE",detail:"PUE"}]},new Set(),true),"unknown_source");
 assert.equal(structuredAnswerIssue({...answer,assumptions:[]},new Set(),true),"missing_support");
 assert.equal(structuredAnswerIssue({...answer,assumptions:[""]},new Set(),true),"section_text");
});
