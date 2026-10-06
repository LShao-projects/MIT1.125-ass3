import test from 'node:test';
import assert from 'node:assert/strict';
import {validatedChatAnswer,AnswerValidationError,groundedFormat} from '../lib/server/adviser-answer';
const gap={answer:'The signed connection date is not established in the available records.',evidenceUsed:[],assumptions:[],uncertainties:['No signed grid offer is recorded.']};
test('unknown citation is corrected using the same evidence, not silently accepted',async()=>{
 const instructions:string[]=[];
 const result=await validatedChatAnswer(async instruction=>{instructions.push(instruction);return JSON.stringify(instructions.length===1?{...gap,evidenceUsed:[{sourceId:'claim-grid-date',detail:'Unknown date.'}]}:gap);},new Set(['S-CALC']),true);
 assert.deepEqual(result,gap);assert.equal(instructions.length,2);assert.match(instructions[1],/unknown_source/);
});
test('two invalid answers remain rejected without loosening source checks',async()=>{
 let calls=0;
 await assert.rejects(validatedChatAnswer(async()=>{calls++;return JSON.stringify({...gap,evidenceUsed:[{sourceId:'S-FAKE',detail:'Approve construction.'}]});},new Set(),true),AnswerValidationError);
 assert.equal(calls,2);
});
test('valid gap answers need no retry and generated citation IDs are constrained',async()=>{
 let calls=0;assert.deepEqual(await validatedChatAnswer(async()=>{calls++;return JSON.stringify(gap);},new Set(),true),gap);assert.equal(calls,1);
 assert.deepEqual(groundedFormat(new Set(['S-CALC'])).schema.properties.evidenceUsed.items.properties.sourceId,{type:'string',enum:['S-CALC']});
 assert.equal(groundedFormat(new Set()).schema.properties.evidenceUsed.maxItems,0);
});
