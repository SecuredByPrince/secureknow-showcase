import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {CONTACT,emailLink,subjects,roadmap,partnerCategories} from '../src/lib/content.ts';
import {DEMOS,exampleDecision,validDraft,WORKFLOW_STEPS,parsePreview,previewLink,sampleAnswer,compareSamples,reviewSamples} from '../src/lib/demo.ts';
import {validateEnvironment} from '../scripts/environment.mjs';
test('Netlify static deployment uses out, parity security headers and a required production origin',()=>{
    const config=readFileSync(new URL('../netlify.toml',import.meta.url),'utf8');
    assert.match(config,/command = "npm run build"/);assert.match(config,/publish = "out"/);
    assert(!/redirect|functions|repo.*reference-architecture/.test(config));
    const headers=readFileSync(new URL('../public/_headers',import.meta.url),'utf8');
    const vercel=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
    for(const header of vercel.headers[0].headers)assert(headers.includes(`${header.key}: ${header.value}`));
    assert.throws(()=>validateEnvironment({CONTEXT:'production'}),/Production showcase/);
    validateEnvironment({CONTEXT:'production',NEXT_PUBLIC_SHOWCASE_ORIGIN:'https://secureknow-preview.netlify.app'});
    validateEnvironment({CONTEXT:'deploy-preview'});
});
test('Contact contracts use the exact subjects and required suggested fields',()=>{
    const expected={partner:'SecureKnow — Partnership Enquiry',sponsor:'SecureKnow — Sponsorship Enquiry',demo:'SecureKnow — Demo Request',pilot:'SecureKnow — Enterprise Pilot Interest',support:'SecureKnow — Support Enquiry',general:'SecureKnow — General Enquiry'};
    for(const [kind,subject] of Object.entries(expected)){
        const href=emailLink(kind),url=new URL(href);
        assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,'securedbyprince@gmail.com');
        assert.equal(url.searchParams.get('subject'),subject);
        assert(href.includes('subject='+encodeURIComponent(subject)));assert(!href.includes('\n'));
    }
    const fields={partner:['Organisation:','Partnership interest:','Proposed collaboration:'],sponsor:['Sponsorship interest:','Organisation:','Contact name and details:'],demo:['Organisation:','My role:','Preferred meeting time:','Use case:'],pilot:['Organisation:','Department:','Use case:','Approximate pilot team size:']};
    for(const [kind,required] of Object.entries(fields)){
        const href=emailLink(kind),body=new URL(href).searchParams.get('body');
        for(const field of required)assert(body.includes(field),kind+': '+field);
        assert(body.startsWith('Hello SecureKnow Team,\n\n'));
        assert(href.includes('&body='+encodeURIComponent(body)));
    }
    for(const kind of Object.keys(subjects))assert.equal(new URL(emailLink(kind)).pathname,CONTACT);
});
test('Hero demo and partnership actions point to real public destinations',()=>{
    const home=readFileSync(new URL('../src/app/page.tsx',import.meta.url),'utf8');
    assert.match(home,/href="\/partners\/">Partner With SecureKnow/);
    assert.match(home,/href="\/demo\/#product-preview">Explore Interactive Demo/);
    assert(!/href="#"/.test(home));
});
test('Seven deep links select bounded preview IDs and fail safely for invalid input',()=>{
    for(const item of DEMOS){
        const url=new URL(previewLink(item.id),'https://example.org');
        assert.equal(url.pathname,'/demo/');assert.equal(url.hash,'#product-preview');
        assert.equal(parsePreview(url.searchParams.get('preview')),item.id);
    }
    for(const value of [null,'','../dashboard','<img onerror=alert(1)>'])assert.equal(parsePreview(value),'assistant');
});
test('Unavailable sample evidence abstains and cannot expose a citation',()=>{
    assert(sampleAnswer('vpn').eligible);assert(sampleAnswer('equipment').source);
    for(const value of ['unavailable','unknown','<script>']){
        const answer=sampleAnswer(value);assert.equal(answer.eligible,false);
        assert.equal(answer.source,null);assert.equal(answer.evidence,null);
    }
});
test('Research rejects duplicate or unknown documents and returns only selected sample references',()=>{
    assert.equal(compareSamples('equipment','equipment'),null);
    assert.equal(compareSamples('equipment','unknown'),null);
    const result=compareSamples('equipment','onboarding');
    assert.deepEqual(result.sources.map(s=>s.id),['equipment','onboarding']);
    assert(result.gap.includes('Neither'));
});
test('Monitoring uses a fixed synthetic window and keeps overdue records visible',()=>{
    assert.equal(reviewSamples(7).length,2);assert.equal(reviewSamples(30).length,3);
    assert(reviewSamples(7).some(item=>item.days<0));
});
test('Four partnership categories have distinct contact purposes',()=>{
    assert.equal(partnerCategories.length,4);
    assert.equal(new Set(partnerCategories.map(item=>new URL(emailLink(item.kind)).searchParams.get('subject'))).size,4);
});
test('Example decisions keep authority and execution separate',()=>{assert.equal(exampleDecision('ordinary').outcome,'ALLOW');assert.equal(exampleDecision('sensitive').outcome,'APPROVAL_REQUIRED');assert.equal(exampleDecision('outside').outcome,'DENY');assert(exampleDecision('ordinary').obligations.includes('Employee confirmation'));assert(exampleDecision('ordinary').obligations.includes('Execution unavailable'));assert(exampleDecision('sensitive').obligations.includes('Independent authorised approver'));});
test('Draft validation rejects blank and excessive inputs',()=>{assert(validDraft('VPN','Example timeout'));for(const pair of [['','details'],['  ','details'],['summary',''],['x'.repeat(161),'details'],['summary','x'.repeat(1001)]])assert(!validDraft(...pair));});
test('Preview never has a completed, submitted or executed state',()=>{assert.deepEqual(WORKFLOW_STEPS,['Guidance','Draft','Review','Policy check','Next steps']);});
test('Every requested preview is available, including future monitoring',()=>{assert.deepEqual(DEMOS.map(d=>d.id),['assistant','governance','policy','research','monitoring','workflow','passport']);assert.equal(new URL(emailLink('general')).searchParams.get('subject'),'SecureKnow — General Enquiry');});
test('Private environment configuration fails closed',()=>{for(const key of ['NEXT_PUBLIC_ENTRA_CLIENT_ID','NEXT_PUBLIC_LOCAL_TEST_AUTH','NEXT_PUBLIC_SECUREKNOW_API_BASE_URL','NEXT_PUBLIC_SECRET','DATABASE_URL','AZURE_CLIENT_SECRET','ENTRA_TENANT_ID','FOUNDRY_CHAT_DEPLOYMENT'])assert.throws(()=>validateEnvironment({[key]:'synthetic-sentinel'}),/Private application/);});
test('Public origin validation rejects unsafe URLs and unconfigured production',()=>{for(const value of ['http://example.com','https://user:pass@example.com','https://example.com/private','https://localhost','https://127.0.0.1','https://example.com/?secret=x'])assert.throws(()=>validateEnvironment({NEXT_PUBLIC_SHOWCASE_ORIGIN:value}));assert.throws(()=>validateEnvironment({VERCEL_ENV:'production'}));validateEnvironment({NEXT_PUBLIC_SHOWCASE_ORIGIN:'https://public.example.org',VERCEL_ENV:'production'});validateEnvironment({});});
test('Static architecture has no API/auth dependency, wildcard rewrite or middleware',()=>{const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));assert.deepEqual(Object.keys(pkg.dependencies).sort(),['next','react','react-dom']);const config=readFileSync(new URL('../next.config.mjs',import.meta.url),'utf8');assert.match(config,/output:\s*'export'/);const vercel=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url)));assert.equal(vercel.outputDirectory,'out');assert.equal(vercel.rewrites,undefined);const app=readdirSync(new URL('../src/app',import.meta.url));for(const path of ['api','auth','login','redirect','dev','dashboard'])assert(!app.includes(path));});
test('Security headers prevent framing, network APIs and form submission',()=>{const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url)));const headers=Object.fromEntries(config.headers[0].headers.map(h=>[h.key,h.value]));assert.match(headers['Content-Security-Policy'],/connect-src 'none'/);assert.match(headers['Content-Security-Policy'],/form-action 'none'/);assert.match(headers['Content-Security-Policy'],/frame-ancestors 'none'/);assert.equal(headers['X-Content-Type-Options'],'nosniff');});
test('Public roadmap distinguishes local completion from integrations and upcoming work',()=>{assert.deepEqual(roadmap.map(r=>r.title),['Completed locally','Current priorities','Upcoming']);assert(roadmap[1].items.some(x=>x.includes('Entra')));assert(roadmap[2].items.some(x=>x.includes('Durable workflows')));});
test('Source imports cannot escape the showcase boundary',()=>{const root=resolve(import.meta.dirname,'..');function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const path=resolve(dir,item.name);if(item.isDirectory())walk(path);else if(/\.(tsx?|mjs)$/.test(path)){const text=readFileSync(path,'utf8');for(const match of text.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)){const spec=match[1];if(spec.startsWith('.'))assert(resolve(dir,spec).startsWith(root+'\\')||resolve(dir,spec).startsWith(root+'/'));else assert(['react','next'].some(p=>spec===p||spec.startsWith(p+'/')),spec);}}}}walk(resolve(root,'src'));});
