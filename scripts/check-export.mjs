import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
export async function filesIn(dir) {const result=[];for(const item of await readdir(dir,{withFileTypes:true})){const full=resolve(dir,item.name);assert(!item.isSymbolicLink(),'No symbolic links in public source/artifact');if(item.isDirectory())result.push(...await filesIn(full));else result.push(full);}return result;}
export async function checkExport(base=root) {
    const out=resolve(base,'out');const files=await filesIn(out);
    const allowedHtml=new Set(['index.html','demo/index.html','partners/index.html','privacy/index.html','404.html','404/index.html','_not-found/index.html']);
    for(const file of files){
        const path=relative(out,file).replaceAll('\\','/');
        if(path.endsWith('.html'))assert(allowedHtml.has(path),`Unexpected exported route: ${path}`);
        assert(!path.endsWith('.map'),'Production source map exported');
        assert(!/(?:^|\/)(?:\.env[^/]*|\.git|api|auth|login|dashboard|dev|redirect|documents|workflows)(?:\/|$)/i.test(path),`Private path exported: ${path}`);
        if(['.js','.json','.html','.txt','.css','.xml'].includes(extname(path))){
            const content=await readFile(file,'utf8');
            assert(!/NEXT_PUBLIC_(?:ENTRA|LOCAL_TEST_AUTH|SECUREKNOW_API)|local-development:0000|fictional-quasar-policy|127\.0\.0\.1:8000|localhost:8000|secureknow_preview|secureknow-local-api|BEGIN (?:RSA |EC )?PRIVATE KEY|postgresql(?:\+psycopg)?:\/\//i.test(content),`Private configuration/data marker in ${path}`);
        }
    }
    for(const page of ['index.html','demo/index.html','partners/index.html','privacy/index.html','404.html'])await stat(resolve(out,page));
    await stat(resolve(out,'social-preview.png'));
    assert(files.length>0);
    const source=await filesIn(resolve(base,'src'));
    for(const file of source){const content=await readFile(file,'utf8');assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|next\/headers|['"]use server['"]|@azure\/|localStorage|sessionStorage|process\.env\.(?!NEXT_PUBLIC_SHOWCASE_ORIGIN|VERCEL_ENV)/.test(content),`Network, private identity or persistence API in public source: ${relative(base,file)}`);}
    console.log(`PASS public export: ${files.length} files; four public pages; no private routes, source maps, API/configuration markers or client network/storage APIs.`);
    return files;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename))await checkExport();
