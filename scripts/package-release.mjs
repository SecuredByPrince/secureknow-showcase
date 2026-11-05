// Explicit allowlist only. No Git operations or deployment commands.
import {mkdir,copyFile,readFile,lstat,writeFile} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {filesIn,checkExport} from './check-export.mjs';
const root=resolve(import.meta.dirname,'..');await checkExport(root);
const workspace=resolve(root,'../..');
const destination=resolve(workspace,'.data/phase2c/public-release');
await mkdir(destination,{recursive:true});
const allowed=['package.json','package-lock.json','next.config.mjs','tsconfig.json','eslint.config.mjs','vercel.json','.gitignore','.vercelignore','README.md','src','public','scripts','tests'];
const manifest=[];
for(const item of allowed){const source=resolve(root,item);const info=await lstat(source);if(info.isSymbolicLink())throw new Error('Symlinks forbidden');const files=info.isDirectory()?await filesIn(source):[source];for(const file of files){const path=relative(root,file);if(/(?:^|[\\/])(?:\.env[^\\/]*|__pycache__|node_modules|\.vercel|\.next)(?:[\\/]|$)/i.test(path))throw new Error('Forbidden release file');if(!/\.(?:mjs|ts|tsx|css|json|md|svg|png|py)$/.test(path)&&!['.gitignore','.vercelignore'].includes(path))throw new Error('Unreviewed release extension');const target=resolve(destination,path);await mkdir(dirname(target),{recursive:true});await copyFile(file,target);manifest.push({path:path.replaceAll('\\','/'),sha256:createHash('sha256').update(await readFile(file)).digest('hex')});}}
// Refuse stale/unreviewed files if this staging directory already exists.
const expected=new Set(manifest.map(m=>m.path));expected.add('PUBLIC_RELEASE_MANIFEST.json');
for(const file of await filesIn(destination))if(!expected.has(relative(destination,file).replaceAll('\\','/')))throw new Error('Unexpected file in release staging; review before publication');
await writeFile(resolve(destination,'PUBLIC_RELEASE_MANIFEST.json'),JSON.stringify({purpose:'Public showcase source staged for review; not approved or published',files:manifest},null,2));
console.log(`Prepared ${manifest.length} allowlisted public source files in .data/phase2c/public-release. Nothing committed, pushed, linked or deployed.`);
