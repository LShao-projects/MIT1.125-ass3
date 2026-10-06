import {test} from 'node:test';
import assert from 'node:assert/strict';
import {composeResearchCard,researchEvidence,evidenceReviewPassed} from '../lib/research-quality';
import {compactResearchSections} from '../lib/research';
const text='Proposed decision\nProceed with the build route.\nRationale\nWe have operational expertise.\nEvidence\nThe public tender specifies procurement stages. [1]\nUnknowns\nNone.';
const start=text.indexOf('[1]');
const blocks=[{text,citations:[{type:'url_citation' as const,start_index:start,end_index:start+3,url:'https://www.genci.fr/tender',title:'Tender'}]}];
test('financing card cannot inherit generated investment approval or invented capabilities',()=>{
 const result=composeResearchCard(blocks,'financing','build');
 assert.doesNotMatch(result[0].text,/Proceed with the build|operational expertise/);
 assert.match(result[0].text,/grid offer, permits, bids and member commitments/);
 assert.match(result[0].text,/not lender requirements/);
 const e=compactResearchSections(result)[2].block,c=e.citations[0];
 assert.equal(e.text.slice(c.start_index,c.end_index),'[1]');
 assert.equal(e.text.trim(),researchEvidence(blocks).text.trim());
 assert.equal(c.url,blocks[0].citations[0].url);
});
test('lease proposal does not require consortium construction',()=>{
 const result=composeResearchCard(blocks,'financing','lease')[0].text;
 assert.match(result,/Compare lease offers/);assert.doesNotMatch(result,/construction only after/);
});
const review=(supported=true,urls=['https://www.genci.fr/tender'])=>({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:JSON.stringify({supported,checkedUrls:urls,reason:supported?'supported':'unsupported_claim'})}]}]});
test('evidence review requires successful search and every exact cited URL',()=>{
 const evidence=researchEvidence(blocks);
 assert.equal(evidenceReviewPassed(review(),evidence),true);
 assert.equal(evidenceReviewPassed(review(false),evidence),false);
 assert.equal(evidenceReviewPassed(review(true,[]),evidence),false);
 assert.equal(evidenceReviewPassed(review(true,['https://other.example']),evidence),false);
 assert.equal(evidenceReviewPassed({...review(),output:review().output.slice(1)},evidence),false);
 assert.equal(evidenceReviewPassed({...review(),status:'incomplete'},evidence),false);
});
