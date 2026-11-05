import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {checkExport} from '../scripts/check-export.mjs';

test('Export inspection accepts public assets and rejects private routes, configuration, maps and client fetch',async()=>{
    const base=await mkdtemp(join(tmpdir(),'secureknow-public-export-'));
    try {
        await mkdir(join(base,'src'));
        for(const path of ['index.html','demo/index.html','partners/index.html','privacy/index.html','404.html','social-preview.png']){
            await mkdir(dirname(join(base,'out',path)),{recursive:true});await writeFile(join(base,'out',path),'public example');
        }
        await checkExport(base);
        for(const [path,content] of [['out/dashboard/index.html','private route'],['out/leak.js','localhost:8000'],['out/client.js.map','{}'],['src/network.ts','fetch("/api")']]){
            const file=join(base,path);await mkdir(dirname(file),{recursive:true});await writeFile(file,content);
            await assert.rejects(checkExport(base));await rm(file);
        }
    } finally {await rm(base,{recursive:true,force:true});}
});
