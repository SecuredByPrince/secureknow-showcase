// Loopback-only, production-export QA server. No proxy and no SPA fallback.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {checkExport} from './check-export.mjs';
const root=resolve(import.meta.dirname,'../out');
await checkExport();
const config=JSON.parse(await readFile(resolve(import.meta.dirname,'../vercel.json'),'utf8'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
    for(const header of config.headers[0].headers)res.setHeader(header.key,header.value);
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
    try {
        const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
        let file=resolve(root,'.'+path);
        if(!(file===root||file.startsWith(root+sep))||path.includes('\\')||path.includes('\0'))throw new Error('invalid_path');
        if((await stat(file)).isDirectory())file=resolve(file,'index.html');
        const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream'});res.end(req.method==='HEAD'?undefined:body);
    }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:await readFile(resolve(root,'404.html')));}
});
server.listen(3101,'127.0.0.1',()=>console.log('Public showcase export: http://127.0.0.1:3101 (enterprise 3001/8000 untouched)'));
