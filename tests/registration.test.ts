import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registrationSchema,registrationComplete,RULES_VERSION} from '../lib/registration';
test('registration needs section, team and explicit agreement',()=>{
 const good={name:'Student',courseSection:'Section A',team:'Team 3',agreeToRules:true};assert.ok(registrationSchema.safeParse(good).success);
 for(const change of [{courseSection:''},{team:' '},{agreeToRules:false},{agreeToRules:undefined},{role:'admin'},{email:'impersonate@example.test'},{userId:'another-user'}])assert.equal(registrationSchema.safeParse({...good,...change}).success,false);
});
test('old rows and stale rules do not enable registered permissions',()=>{
 assert.equal(registrationComplete(undefined),false);assert.equal(registrationComplete({team:'Team 3'}),false);
 const complete={courseSection:'A',team:'Team 3',rulesAcceptedAt:'2026-10-05',rulesVersion:RULES_VERSION};assert.equal(registrationComplete(complete),true);assert.equal(registrationComplete({...complete,rulesVersion:'old'}),false);
});
