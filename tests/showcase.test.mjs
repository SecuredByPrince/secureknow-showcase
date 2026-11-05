import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {CONTACT,emailLink,subjects,roadmap} from '../src/lib/content.ts';
import {DEMOS,exampleDecision,validDraft,WORKFLOW_STEPS} from '../src/lib/demo.ts';
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
test('Partnership, sponsorship and demo mail links encode the exact suggested messages',()=>{
    const expected={
        partner:"Hello SecureKnow Team,\n\nI'm interested in exploring a partnership with SecureKnow.\n\nMy name:\nOrganisation:\nPartnership interest:\nAdditional details:\n\nI look forward to hearing from you.",
        sponsor:"Hello SecureKnow Team,\n\nI'm interested in learning more about sponsorship opportunities for SecureKnow.\n\nMy name:\nOrganisation:\nArea of sponsorship:\nAdditional details:\n\nThank you.",
        demo:"Hello SecureKnow Team,\n\nI'd like to request a demonstration of SecureKnow.\n\nMy name:\nOrganisation:\nPreferred meeting date:\nWhat I'd like to explore:\n\nThank you.",
    };
    for(const [kind,body] of Object.entries(expected)){
        const href=emailLink(kind),url=new URL(href);
        assert.equal(url.pathname,'securedbyprince@gmail.com');
        assert.equal(url.searchParams.get('subject'),subjects[kind]);
        assert.equal(url.searchParams.get('body'),body);
        assert(href.includes('&body='+encodeURIComponent(body)));
        assert(!href.includes('\n'));
    }
    assert.equal(new URL(emailLink('support')).searchParams.get('body'),null);
});
test('Partnership hero CTA opens the public partners page instead of email',()=>{const home=readFileSync(new URL('../src/app/page.tsx',import.meta.url),'utf8');assert.match(home,/href="\/partners\/">Partner With Us/);assert(!/href="#"/.test(home));});
test('Every enquiry uses the approved email and exact encoded subject',()=>{assert.equal(CONTACT,'securedbyprince@gmail.com');const expected={partner:'SecureKnow Partnership Enquiry',sponsor:'SecureKnow Sponsorship Enquiry',demo:'SecureKnow Demo Request',pilot:'SecureKnow Pilot Interest',support:'SecureKnow Support Enquiry'};for(const [key,value]of Object.entries(expected)){const url=new URL(emailLink(key));assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,CONTACT);assert.equal(url.searchParams.get('subject'),value);}for(const key of Object.keys(subjects))assert(emailLink(key).startsWith('mailto:'+CONTACT+'?subject='));});
test('Example decisions keep authority and execution separate',()=>{assert.equal(exampleDecision('ordinary').outcome,'ALLOW');assert.equal(exampleDecision('sensitive').outcome,'APPROVAL_REQUIRED');assert.equal(exampleDecision('outside').outcome,'DENY');assert(exampleDecision('ordinary').obligations.includes('Employee confirmation'));assert(exampleDecision('ordinary').obligations.includes('Execution unavailable'));assert(exampleDecision('sensitive').obligations.includes('Independent authorised approver'));});
test('Draft validation rejects blank and excessive inputs',()=>{assert(validDraft('VPN','Example timeout'));for(const pair of [['','details'],['  ','details'],['summary',''],['x'.repeat(161),'details'],['summary','x'.repeat(1001)]])assert(!validDraft(...pair));});
test('Preview never has a completed, submitted or executed state',()=>{assert.deepEqual(WORKFLOW_STEPS,['Guidance','Draft','Review','Policy check','Next steps']);});
test('Every requested preview is available, including future monitoring',()=>{assert.deepEqual(DEMOS.map(d=>d.id),['assistant','governance','policy','research','monitoring','workflow','passport']);assert.equal(new URL(emailLink('general')).searchParams.get('subject'),'SecureKnow General Enquiry');});
test('Private environment configuration fails closed',()=>{for(const key of ['NEXT_PUBLIC_ENTRA_CLIENT_ID','NEXT_PUBLIC_LOCAL_TEST_AUTH','NEXT_PUBLIC_SECUREKNOW_API_BASE_URL','NEXT_PUBLIC_SECRET','DATABASE_URL','AZURE_CLIENT_SECRET','ENTRA_TENANT_ID','FOUNDRY_CHAT_DEPLOYMENT'])assert.throws(()=>validateEnvironment({[key]:'synthetic-sentinel'}),/Private application/);});
test('Public origin validation rejects unsafe URLs and unconfigured production',()=>{for(const value of ['http://example.com','https://user:pass@example.com','https://example.com/private','https://localhost','https://127.0.0.1','https://example.com/?secret=x'])assert.throws(()=>validateEnvironment({NEXT_PUBLIC_SHOWCASE_ORIGIN:value}));assert.throws(()=>validateEnvironment({VERCEL_ENV:'production'}));validateEnvironment({NEXT_PUBLIC_SHOWCASE_ORIGIN:'https://public.example.org',VERCEL_ENV:'production'});validateEnvironment({});});
test('Static architecture has no API/auth dependency, wildcard rewrite or middleware',()=>{const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));assert.deepEqual(Object.keys(pkg.dependencies).sort(),['next','react','react-dom']);const config=readFileSync(new URL('../next.config.mjs',import.meta.url),'utf8');assert.match(config,/output:\s*'export'/);const vercel=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url)));assert.equal(vercel.outputDirectory,'out');assert.equal(vercel.rewrites,undefined);const app=readdirSync(new URL('../src/app',import.meta.url));for(const path of ['api','auth','login','redirect','dev','dashboard'])assert(!app.includes(path));});
test('Security headers prevent framing, network APIs and form submission',()=>{const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url)));const headers=Object.fromEntries(config.headers[0].headers.map(h=>[h.key,h.value]));assert.match(headers['Content-Security-Policy'],/connect-src 'none'/);assert.match(headers['Content-Security-Policy'],/form-action 'none'/);assert.match(headers['Content-Security-Policy'],/frame-ancestors 'none'/);assert.equal(headers['X-Content-Type-Options'],'nosniff');});
test('Public roadmap distinguishes local completion from integrations and upcoming work',()=>{assert.deepEqual(roadmap.map(r=>r.title),['Completed locally','Current priorities','Upcoming']);assert(roadmap[1].items.some(x=>x.includes('Entra')));assert(roadmap[2].items.some(x=>x.includes('Durable workflows')));});
test('Source imports cannot escape the showcase boundary',()=>{const root=resolve(import.meta.dirname,'..');function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const path=resolve(dir,item.name);if(item.isDirectory())walk(path);else if(/\.(tsx?|mjs)$/.test(path)){const text=readFileSync(path,'utf8');for(const match of text.matchAll(/(?:from\s*|import\s*\()['"]([^'"]+)['"]/g)){const spec=match[1];if(spec.startsWith('.'))assert(resolve(dir,spec).startsWith(root+'\\')||resolve(dir,spec).startsWith(root+'/'));else assert(['react','next'].some(p=>spec===p||spec.startsWith(p+'/')),spec);}}}}walk(resolve(root,'src'));});
