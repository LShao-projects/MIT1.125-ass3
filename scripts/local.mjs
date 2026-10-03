import {spawnSync} from 'node:child_process';
import {existsSync,readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {join,dirname} from 'node:path';
const [command,...args]=process.argv.slice(2);
let runtime=process.execPath;
if(Number(process.versions.node.split('.')[0])<22){
 const bundled=join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node');
 if(!existsSync(bundled)){console.error('Use Node.js 22.13 or newer to run this website.');process.exit(1)}
 runtime=bundled;
}
const env={...process.env,PATH:dirname(runtime)+':'+process.env.PATH};
const run=(file,rest)=>{const r=spawnSync(runtime,[file,...rest],{stdio:'inherit',env});if(r.error)throw r.error;return r.status??1};
if(command==='dev'||command==='build')process.exit(run('scripts/run-framework.mjs',[command,...args]));
if(command==='test'){
 const files=readdirSync('tests').filter(f=>f.endsWith('.test.ts')).map(f=>'tests/'+f);
 const r=spawnSync(runtime,['--import','tsx','--test',...files],{stdio:'inherit',env});process.exit(r.status??1);
}
if(command==='typecheck')process.exit(run('node_modules/typescript/bin/tsc',['--noEmit']));
console.error('Expected dev, build, test or typecheck.');process.exit(1);
