"""Anonymous Chromium QA for the static showcase; never sends email or executes work.

Uses existing Playwright and axe tooling. SHOWCASE_BASE_URL selects local/production.
SHOWCASE_QA_ROOT can point to a workspace containing apps/web/node_modules/axe-core.
All screenshots/results are local, outside the deployed export.
"""
import json
import os
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlparse

from playwright.sync_api import expect, sync_playwright

REPO = Path(__file__).resolve().parents[1]
QA_ROOT = Path(os.environ['SHOWCASE_QA_ROOT']) if os.getenv('SHOWCASE_QA_ROOT') else next(
    (p for p in REPO.parents if (p/'apps/web/node_modules/axe-core/axe.min.js').exists()), REPO)
AXE = Path(os.environ.get('SHOWCASE_AXE_PATH',str(QA_ROOT/'apps/web/node_modules/axe-core/axe.min.js')))
OUT = Path(os.environ.get('SHOWCASE_QA_OUTPUT',str(QA_ROOT/'.data/showcase-production-qa')))
OUT.mkdir(parents=True,exist_ok=True)
BASE = os.environ.get('SHOWCASE_BASE_URL','http://127.0.0.1:3101').rstrip('/')
WIDTHS = [(1440,900),(1024,768),(768,1024),(390,844),(320,780)]
REFERENCE = 'https://github.com/SecuredByPrince/secureknow-reference-architecture'
CONTACT = 'securedbyprince@gmail.com'
SUBJECTS = {
    'SecureKnow \u2014 Demo Request':['Organisation:','My role:','Preferred meeting time:','Use case:'],
    'SecureKnow \u2014 Partnership Enquiry':['Organisation:','Partnership interest:','Proposed collaboration:'],
    'SecureKnow \u2014 Sponsorship Enquiry':['Sponsorship interest:','Organisation:','Contact name and details:'],
    'SecureKnow \u2014 Enterprise Pilot Interest':['Organisation:','Department:','Use case:','Approximate pilot team size:'],
    'SecureKnow \u2014 Support Enquiry':[], 'SecureKnow \u2014 General Enquiry':[],
    'SecureKnow \u2014 Product and Research Collaboration':['Proposed collaboration:'],
    'SecureKnow \u2014 Strategic Funding Enquiry':[],
}
DEMOS = [('assistant','AI Assistant'),('governance','Governance'),('policy','Policy Decisions'),('research','Research Agent'),('workflow','IT Workflow'),('monitoring','Monitoring Agent'),('passport','Trust Passport')]
errors,console_errors,failed,http_errors,requests = [],[],[],[],[]
scans,clicks,performance = [],[],[]

with sync_playwright() as p:
    browser=p.chromium.launch()
    context=browser.new_context(reduced_motion='reduce',permissions=['clipboard-write'])
    page=context.new_page()
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('console',lambda message:console_errors.append(message.text) if message.type=='error' else None)
    page.on('requestfailed',lambda request:failed.append(request.url))
    page.on('response',lambda response:http_errors.append({'url':response.url,'status':response.status}) if response.status>=400 else None)
    page.on('request',lambda request:requests.append(request.url))
    page.add_init_script("""window.__qaMetrics={cls:0,lcp:null};
        try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__qaMetrics.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
        new PerformanceObserver(list=>{for(const e of list.getEntries())window.__qaMetrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});}catch{}""")

    def install_mail_interceptor():
        page.evaluate("""()=>{if(window.__qaMailInstalled)return;window.__qaMailInstalled=true;
            document.addEventListener('click',event=>{const link=event.target.closest('a[href^="mailto:"]');
            if(link){window.__qaEmail={href:link.href,alreadyPrevented:event.defaultPrevented};event.preventDefault();}});} """)

    def open_page(route):
        response=page.goto(BASE+route)
        if response is None:response=page.reload()
        assert response.status==200,(route,response.status)
        install_mail_interceptor()
        expect(page.locator('h1')).to_be_visible()

    def no_overflow(label):
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),label

    def scan(label):
        no_overflow(label)
        page.add_script_tag(path=str(AXE))
        violations=page.evaluate("async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))")
        (OUT/f'axe-{label}.json').write_text(json.dumps(violations,indent=2))
        assert not violations,(label,violations)
        scans.append(label)

    def validate_mail(href):
        parsed=urlparse(href);query=parse_qs(parsed.query)
        assert parsed.scheme=='mailto' and parsed.path==CONTACT
        subject=query['subject'][0]
        assert subject in SUBJECTS,subject
        for field in SUBJECTS[subject]:assert field in query['body'][0],(subject,field)
        assert '\n' not in href and '\r' not in href
        return query

    def click_mail(link,label):
        expected=validate_mail(link.get_attribute('href'))
        link.click()
        actual=page.evaluate('window.__qaEmail')
        assert not actual['alreadyPrevented'],label
        assert validate_mail(actual['href'])==expected
        clicks.append({'kind':'mailto','label':label,'subject':expected['subject'][0]})

    def menu_check():
        menu=page.get_by_role('button',name='Menu',exact=True)
        if not menu.is_visible():return
        menu.click();nav=page.get_by_role('navigation',name='Main',exact=True)
        expect(nav).to_be_visible()
        click_mail(nav.get_by_role('link',name='Request a Demo',exact=True),'mobile Request a Demo')
        expect(menu).to_have_attribute('aria-expanded','false')
        menu.click();page.get_by_role('button',name='Close menu',exact=True).press('Escape')
        expect(menu).to_be_focused();expect(menu).to_have_attribute('aria-expanded','false')
        menu.press('Enter');nav.get_by_role('link',name='Platform',exact=True).focus()
        page.keyboard.press('Escape');expect(menu).to_be_focused()

    def copy_checks(route):
        for index,component in enumerate(page.locator('.email-contact').all()):
            button=component.get_by_role('button',name='Copy Email Address',exact=True)
            button.focus();button.press('Enter')
            expect(component.get_by_role('status')).to_have_text('Email address copied.')
            clicks.append({'kind':'clipboard','label':f'{route} copy {index}','result':'permitted browser write succeeded'})
        if route=='/partners/':
            page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('QA permission denied'))}})")
            component=page.locator('.email-contact').first
            component.get_by_role('button',name='Copy Email Address',exact=True).click()
            expect(component.get_by_role('status')).to_contain_text('Automatic copy is unavailable')
            field=component.get_by_role('textbox',name='Email address to copy',exact=True)
            expect(field).to_be_visible();expect(field).to_have_value(CONTACT);expect(field).to_be_focused()
            assert field.evaluate('(e)=>e.selectionStart===0&&e.selectionEnd===e.value.length')
            component.get_by_role('button',name='Select email address',exact=True).click()
            expect(field).to_be_focused()
            clicks.append({'kind':'clipboard','label':'denied permission','result':'visible selectable fallback'})

    def select_demo(label):
        root=page.locator('#product-preview')
        root.get_by_role('tab',name=label,exact=True).click()
        assert root.get_by_role('tabpanel').count()==1
        return root.get_by_role('tabpanel')

    def demos(width):
        open_page('/demo/')
        root=page.locator('#product-preview')
        for _,label in DEMOS:
            panel=select_demo(label);expect(panel).to_be_visible();scan(f'{width}-demo-{label.replace(" ","-")}')
        panel=select_demo('AI Assistant')
        panel.get_by_label('Example organisational question',exact=True).select_option('unavailable')
        panel.get_by_role('button',name='Reveal example answer',exact=True).click()
        expect(panel.get_by_text('Example abstention',exact=True)).to_be_visible()
        assert not panel.get_by_role('button',name='Inspect sample citation',exact=True).count()
        panel.get_by_label('Example organisational question',exact=True).select_option('equipment')
        panel.get_by_role('button',name='Reveal example answer',exact=True).click()
        panel.get_by_role('button',name='Inspect sample citation',exact=False).click()
        expect(panel.get_by_role('heading',name='Equipment Policy',exact=True)).to_be_visible()
        panel.get_by_role('button',name='Reset assistant example',exact=True).click()
        assert not panel.locator('.answer').count()
        panel.get_by_role('button',name='Reveal example answer',exact=True).click()
        panel.get_by_role('button',name='Prepare an IT support request',exact=False).click()
        expect(root.get_by_role('tab',name='IT Workflow',exact=True)).to_be_focused()
        expect(root.get_by_role('tab',name='IT Workflow',exact=True)).to_have_attribute('aria-selected','true')
        panel=select_demo('Governance')
        panel.get_by_role('button',name='Preview review',exact=True).click()
        panel.get_by_role('button',name='Preview publication',exact=True).click()
        expect(panel.get_by_role('heading',name='Published / eligible only after permission checks')).to_be_visible()
        expect(panel.get_by_text('Version 1 is superseded',exact=False)).to_be_visible()
        panel.get_by_role('button',name='Reset governance example',exact=True).click()
        expect(panel.get_by_role('heading',name='Draft / not eligible for answers')).to_be_visible()
        panel=select_demo('Policy Decisions')
        for value,outcome in [('ordinary','ALLOW'),('sensitive','APPROVAL_REQUIRED'),('outside','DENY')]:
            panel.get_by_label('Example request',exact=True).select_option(value)
            panel.get_by_role('button',name='Evaluate example policy',exact=True).click()
            expect(panel.locator('.decision')).to_have_text(outcome)
        panel.get_by_role('button',name='Reset policy example',exact=True).click()
        assert not panel.locator('.decision').count()
        panel=select_demo('Research Agent')
        panel.get_by_label('Second sample document',exact=True).select_option('equipment')
        panel.get_by_role('button',name='Compare sample documents',exact=True).click()
        expect(panel.get_by_role('alert')).to_have_text('Choose two different sample documents.')
        panel.get_by_label('Second sample document',exact=True).select_option('onboarding')
        panel.get_by_role('button',name='Compare sample documents',exact=True).click()
        expect(panel.get_by_role('heading',name='Sample comparison',exact=True)).to_be_visible()
        expect(panel.get_by_text('S1: Equipment Policy / v3',exact=True)).to_be_visible()
        expect(panel.get_by_text('S2: Onboarding Guide / v2',exact=True)).to_be_visible()
        panel.get_by_role('button',name='Reset research example',exact=True).click()
        assert not panel.get_by_role('heading',name='Sample comparison',exact=True).count()
        panel=select_demo('Monitoring Agent')
        panel.get_by_label('Sample review window',exact=True).select_option('7')
        panel.get_by_role('button',name='Preview review check',exact=True).click()
        expect(panel.locator('.review-list li')).to_have_count(2)
        panel.get_by_label('Sample review window',exact=True).select_option('30')
        panel.get_by_role('button',name='Preview review check',exact=True).click()
        expect(panel.locator('.review-list li')).to_have_count(3)
        expect(panel.get_by_text('No notification was sent',exact=False)).to_be_visible()
        panel.get_by_role('button',name='Reset monitoring example',exact=True).click()
        assert not panel.locator('.review-list').count()
        panel=select_demo('IT Workflow')
        panel.get_by_role('button',name='Prepare example ticket',exact=True).click()
        panel.get_by_label('Example ticket summary',exact=True).fill('')
        panel.get_by_role('button',name='Review example ticket',exact=True).click()
        expect(panel.get_by_role('alert')).to_be_visible();scan(f'{width}-workflow-invalid')
        payload='<img src=x onerror=alert(1)>'
        panel.get_by_label('Example ticket summary',exact=True).fill(payload)
        panel.get_by_role('button',name='Review example ticket',exact=True).click()
        expect(panel.get_by_text(payload,exact=True)).to_be_visible();assert not panel.locator('.record img').count()
        panel.get_by_label('Include a privileged system change',exact=False).check()
        panel.get_by_role('button',name='Confirm example & check policy',exact=True).click()
        expect(panel.locator('.decision')).to_have_text('APPROVAL_REQUIRED / example')
        panel.get_by_role('button',name='Explore next steps',exact=True).click()
        expect(panel.get_by_role('button',name='Submit ticket / unavailable',exact=True)).to_be_disabled()
        scan(f'{width}-workflow-boundary')
        panel.get_by_role('button',name='Cancel example draft',exact=True).click()
        expect(panel.get_by_role('status')).to_contain_text('Nothing was submitted or stored')
        panel.get_by_role('button',name='Prepare example ticket',exact=True).click()
        expect(panel.get_by_label('Example ticket summary',exact=True)).to_have_value('')
        panel.get_by_role('button',name='Cancel example draft',exact=True).click()
        panel=select_demo('Trust Passport')
        panel.get_by_label('Illustrative request type',exact=True).select_option('sensitive')
        expect(panel.get_by_text('APPROVAL_REQUIRED / synthetic',exact=True)).to_be_visible()
        panel.get_by_role('button',name='Inspect illustrative audit trail',exact=True).click()
        expect(panel.locator('.audit-preview li')).to_have_count(4)
        expect(panel.get_by_text('No execution event or receipt exists.',exact=True)).to_be_visible()
        panel.get_by_role('button',name='Reset passport example',exact=True).click()
        assert not panel.locator('.audit-preview').count()
        root.get_by_role('tab',name='AI Assistant',exact=True).click()
        root.get_by_role('tab',name='AI Assistant',exact=True).press('ArrowRight')
        expect(root.get_by_role('tab',name='Governance',exact=True)).to_be_focused()
        root.get_by_role('tab',name='Governance',exact=True).press('End')
        expect(root.get_by_role('tab',name='Trust Passport',exact=True)).to_be_focused()
        root.get_by_role('tab',name='Trust Passport',exact=True).press('Home')
        expect(root.get_by_role('tab',name='AI Assistant',exact=True)).to_be_focused()

    def anchor_destination_visible(fragment):
        result=page.evaluate("""id=>{const e=document.getElementById(id);if(!e)return null;
            const heading=[...e.querySelectorAll('h1,h2,h3')].find(h=>h.getBoundingClientRect().height>0)||e;
            return {top:heading.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom};}""",fragment)
        assert result and result['top']>=result['header']-1,(fragment,result)

    def audit_internal_links(width):
        for route in ['/','/partners/','/demo/','/privacy/']:
            open_page(route)
            inventory=page.locator('a[href]').evaluate_all('(els)=>els.map((e,index)=>({index,href:e.getAttribute("href"),label:e.textContent.trim()||e.getAttribute("aria-label")}))')
            for item in inventory:
                href=item['href']
                assert href and href!='#' and not href.startswith('javascript:'),item
                if href.startswith('mailto:') or href.startswith('https:'):continue
                assert href.startswith(('/','#')),item
                open_page(route)
                link=page.locator('a[href]').nth(item['index'])
                if href=='#main':link.focus()
                if not link.is_visible():
                    if link.evaluate('(e)=>!!e.closest("#public-navigation")'):
                        page.get_by_role('button',name='Menu',exact=True).click()
                    else:link.focus()
                link.click()
                if href=='#main':expect(page.locator('main')).to_be_focused()
                expected=urlparse(urljoin(BASE+route,href))
                page.wait_for_url(lambda url:urlparse(str(url)).path.rstrip('/')==expected.path.rstrip('/') and urlparse(str(url)).query==expected.query)
                if expected.fragment:anchor_destination_visible(expected.fragment)
                if 'preview=' in expected.query:
                    preview=parse_qs(expected.query)['preview'][0]
                    label=dict(DEMOS)[preview]
                    expect(page.locator('#product-preview').get_by_role('tab',name=label,exact=True)).to_have_attribute('aria-selected','true')
                assert page.reload().status==200
                clicks.append({'kind':'internal','label':item['label'],'href':href,'width':width,'refresh':200})

    for width,height in WIDTHS:
        page.set_viewport_size({'width':width,'height':height})
        for route in ['/','/partners/','/demo/','/privacy/']:
            open_page(route)
            assert page.locator('.site-header').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(255, 255, 255)'
            if route=='/':
                page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
                measured=page.evaluate("""()=>{const n=performance.getEntriesByType('navigation')[0];const f=performance.getEntriesByName('first-contentful-paint')[0];return {fcp_ms:f?.startTime??null,dom_content_loaded_ms:n.domContentLoadedEventEnd,lcp_ms:window.__qaMetrics.lcp,cls:window.__qaMetrics.cls,script_transfer_bytes:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='script').reduce((sum,r)=>sum+r.transferSize,0)};}""")
                performance.append({'width':width,**measured})
                menu_check()
                hero=page.locator('#hero-preview')
                for label in ['Policy Decisions','IT Workflow','AI Assistant']:
                    hero.get_by_role('tab',name=label,exact=True).click()
                    expect(hero.get_by_role('tab',name=label,exact=True)).to_have_attribute('aria-selected','true')
                journey=page.get_by_role('tablist',name='Know to Prove journey',exact=True)
                for label in ['Know','Verify','Approve','Act','Prove','Know']:
                    journey.get_by_role('tab',name=label,exact=True).click()
                    assert page.locator('.journey-detail:visible').count()==1
                    expect(page.locator('.journey-detail:visible').get_by_role('heading',name=label,exact=True)).to_be_visible()
            for link in page.locator('a[href^="mailto:"]').all():
                if link.is_visible():click_mail(link,link.inner_text())
            copy_checks(route)
            scan(f'{width}-{route.strip("/") or "home"}')
            page.evaluate('window.scrollTo(0,0)')
            page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
            page.screenshot(path=str(OUT/f'{route.strip("/") or "home"}-{width}.png'),full_page=True)
            if route=='/':page.screenshot(path=str(OUT/f'hero-{width}.png'))
        demos(width)
        for preview,label in DEMOS:
            open_page(f'/demo/?preview={preview}#product-preview')
            expect(page.locator('#product-preview').get_by_role('tab',name=label,exact=True)).to_have_attribute('aria-selected','true')
            anchor_destination_visible('product-preview')
            assert page.reload().status==200
            expect(page.locator('#product-preview').get_by_role('tab',name=label,exact=True)).to_have_attribute('aria-selected','true')
        if width in [1440,320]:audit_internal_links(width)
        print(f'PASS {width}px: pages, all seven previews/deep links, contact/copy, keyboard, header offsets and axe',flush=True)

    for route in ['/login','/redirect','/auth/callback','/dev/sign-in','/dashboard','/admin','/administration','/documents','/workspaces','/api/v1/workspaces','/api/v1/dev/token','/.env','/.git/config']:
        response=page.request.get(BASE+route)
        assert response.status==404,(route,response.status)
        assert "connect-src 'none'" in response.headers['content-security-policy']
    assert page.request.post(BASE+'/api/v1/dev/token',data={}).status in [404,405]
    assert page.request.get(BASE+'/social-preview.png').status==200
    if urlparse(BASE).scheme=='https':
        open_page('/partners/');assert page.reload().status==200
        assert page.locator('link[rel="canonical"]').get_attribute('href')==BASE+'/partners/'
        assert page.locator('meta[property="og:image"]').get_attribute('content')==BASE+'/social-preview.png'
        robots=page.request.get(BASE+'/robots.txt');assert robots.status==200 and 'Allow: /' in robots.text()
        sitemap=page.request.get(BASE+'/sitemap.xml');assert sitemap.status==200 and sitemap.text().count('<loc>')==3
        assert BASE+'/demo/' not in sitemap.text()
        open_page('/demo/');assert 'noindex' in page.locator('meta[name="robots"]').get_attribute('content')
        external=browser.new_page()
        external.goto(BASE+'/')
        external.get_by_role('link',name='Reference architecture on GitHub',exact=True).click()
        external.wait_for_url(REFERENCE+'*',wait_until='domcontentloaded')
        assert external.url.rstrip('/')==REFERENCE
        external.close()
    assert not errors,errors
    assert not console_errors,console_errors
    assert not failed,failed
    assert not http_errors,http_errors
    assert all(urlparse(url).netloc==urlparse(BASE).netloc for url in requests if url.startswith('http')), 'Unexpected external/backend request'
    summary={'base_url':BASE,'widths':[w for w,_ in WIDTHS],'axe_scans':len(scans),'violations':0,'runtime_errors':errors,'console_errors':console_errors,'failed_requests':failed,'http_errors':http_errors,'checked_clicks':len(clicks),'performance_samples':performance}
    (OUT/'summary.json').write_text(json.dumps(summary,indent=2))
    (OUT/'cta-clicks.json').write_text(json.dumps(clicks,indent=2))
    print(f'PASS production suite: {len(scans)} axe scans; {len(clicks)} verified actions; no runtime/network errors',flush=True)
    browser.close()
