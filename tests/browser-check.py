"""Production-export journeys; no backend or external sign-in required.

Run with the API Python 3.13 environment and PLAYWRIGHT_BROWSERS_PATH=.data/browsers.
Start npm run preview separately. QA artefacts stay in ignored workspace .data.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(os.environ.get('SHOWCASE_QA_OUTPUT',str(ROOT / '.data/public-launch/browser-local')))
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('SHOWCASE_BASE_URL','http://127.0.0.1:3101').rstrip('/')
scans = 0
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(reduced_motion='reduce')
    errors = []
    console_errors = []
    failures = []
    requests = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: console_errors.append(message.text) if message.type == 'error' else None)
    page.on('requestfailed', lambda request: failures.append(request.url))
    page.on('request', lambda request: requests.append(request.url))
    page.add_init_script("""document.addEventListener('click',event=>{
        const link=event.target.closest('a[href^="mailto:"]');
        if(link){window.lastEmailClick={href:link.href,alreadyPrevented:event.defaultPrevented};event.preventDefault();}
    });""")

    def scan(label):
        global scans
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), label
        page.add_script_tag(path=str(ROOT / 'apps/web/node_modules/axe-core/axe.min.js'))
        violations = page.evaluate("async () => (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))")
        (OUT / f'axe-{label}.json').write_text(json.dumps(violations, indent=2))
        assert not violations, (label, violations)
        scans += 1

    for width, height in [(1440,900),(1024,768),(768,1024),(390,844)]:
        page.set_viewport_size({'width':width,'height':height})
        for route in ['/', '/partners/', '/privacy/', '/demo/']:
            assert page.goto(BASE + route).status == 200
            page.get_by_role('main').wait_for()
            if route == '/':
                page.get_by_role('link',name='Partner With Us',exact=True).click()
                page.wait_for_url('**/partners/**')
                expect(page.get_by_role('heading',name='Partner With SecureKnow',exact=True)).to_be_visible()
                page.reload()
                expect(page.get_by_role('heading',name='Partner With SecureKnow',exact=True)).to_be_visible()
                page.goto(BASE+'/')
                page.get_by_role('link',name='Explore SecureKnow',exact=True).click()
                expect(page.locator('#platform')).to_be_in_viewport()
                hero = page.get_by_role('tablist',name='Hero product preview')
                for name in ['Policy Decisions','IT Workflow','AI Assistant']:
                    hero.get_by_role('tab',name=name,exact=True).click()
                    expect(hero.get_by_role('tab',name=name,exact=True)).to_have_attribute('aria-selected','true')
                journey = page.get_by_role('tablist',name='Know to Prove journey')
                for name in ['Verify','Approve','Act','Prove','Know']:
                    journey.get_by_role('tab',name=name,exact=True).click()
                    expect(journey.get_by_role('tab',name=name,exact=True)).to_have_attribute('aria-selected','true')
                journey.get_by_role('tab',name='Know',exact=True).press('ArrowRight')
                expect(journey.get_by_role('tab',name='Verify',exact=True)).to_be_focused()
                journey.get_by_role('tab',name='Verify',exact=True).press('Home')
                expect(journey.get_by_role('tab',name='Know',exact=True)).to_be_focused()
                menu = page.get_by_role('button',name='Menu',exact=True)
                if menu.is_visible():
                    menu.click()
                    expect(page.get_by_role('navigation',name='Main',exact=True)).to_be_visible()
                    page.get_by_role('button',name='Close menu',exact=True).press('Escape')
                    expect(page.get_by_role('button',name='Menu',exact=True)).to_be_focused()
            scan(f'{route.strip("/") or "home"}-{width}')
            page.screenshot(path=str(OUT / f'{route.strip("/") or "home"}-{width}.png'), full_page=True)
            for href in page.locator('a[href^="mailto:"]').evaluate_all('(els)=>els.map(e=>e.href)'):
                parsed = urlparse(href)
                assert parsed.path == 'securedbyprince@gmail.com'
                assert parse_qs(parsed.query)['subject'][0].startswith('SecureKnow ')
                subject=parse_qs(parsed.query)['subject'][0]
                if subject in ['SecureKnow Partnership Enquiry','SecureKnow Sponsorship Enquiry','SecureKnow Demo Request']:
                    body=parse_qs(parsed.query)['body'][0]
                    assert body.startswith('Hello SecureKnow Team,\n\n') and 'My name:\nOrganisation:' in body
            for link in page.locator('a[href^="mailto:"]').all():
                if not link.is_visible():
                    continue
                expected=link.get_attribute('href')
                link.click()
                clicked=page.evaluate('window.lastEmailClick')
                assert clicked['href']==expected and not clicked['alreadyPrevented']
            copy=page.get_by_role('button',name='Copy email address',exact=True).first
            copy.focus()
            copy.press('Enter')
            expect(page.get_by_text('Email address copied.',exact=True)).to_be_visible()
            if route == '/partners/':
                page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Test permission denied'))}})")
                copy.press('Enter')
                expect(page.get_by_text('Copy is unavailable here.',exact=False)).to_be_visible()
                assert page.get_by_role('link',name='securedbyprince@gmail.com',exact=True).count()>=1
            if route == '/demo/':
                for name in ['Governance','Policy Decisions','Research Agent','Monitoring Agent','IT Workflow','Trust Passport','AI Assistant']:
                    page.get_by_role('tab',name=name,exact=True).click()
                    scan(f'demo-{name.replace(" ","-")}-{width}')
                page.get_by_role('tab',name='Policy Decisions',exact=True).click()
                for value,outcome in [('ordinary','ALLOW'),('sensitive','APPROVAL_REQUIRED'),('outside','DENY')]:
                    page.get_by_label('Example request',exact=True).select_option(value)
                    page.get_by_role('button',name='Evaluate example policy',exact=True).click()
                    expect(page.locator('.decision:visible')).to_have_text(outcome)
                page.get_by_role('tab',name='Monitoring Agent',exact=True).click()
                page.get_by_role('button',name='Preview review list',exact=True).click()
                expect(page.get_by_text('No notification was sent',exact=False)).to_be_visible()
                page.get_by_role('tab',name='Research Agent',exact=True).click()
                page.get_by_role('button',name='Preview research brief',exact=True).click()
                expect(page.get_by_role('heading',name='Sample findings')).to_be_visible()
                page.get_by_role('tab',name='Governance',exact=True).click()
                page.get_by_role('button',name='Preview review',exact=True).click()
                page.get_by_role('button',name='Preview publication',exact=True).click()
                expect(page.get_by_role('heading',name='Published / eligible only after permission checks')).to_be_visible()
                page.get_by_role('tab',name='IT Workflow',exact=True).click()
                page.get_by_role('button',name='Prepare example ticket',exact=True).click()
                page.get_by_label('Example ticket summary',exact=True).fill('')
                page.get_by_role('button',name='Review example ticket',exact=True).click()
                expect(page.locator('.error[role="alert"]')).to_be_visible()
                scan(f'workflow-invalid-{width}')
                payload = '<img src=x onerror=alert(1)>'
                page.get_by_label('Example ticket summary',exact=True).fill(payload)
                page.get_by_role('button',name='Review example ticket',exact=True).click()
                expect(page.get_by_text(payload,exact=True)).to_be_visible()
                assert not page.locator('.record img').count()
                page.get_by_label('Include a privileged system change',exact=False).check()
                page.get_by_role('button',name='Confirm example & check policy',exact=True).click()
                expect(page.locator('.decision:visible')).to_have_text('APPROVAL_REQUIRED / example')
                page.get_by_role('button',name='Explore next steps',exact=True).click()
                expect(page.get_by_role('button',name='Submit ticket / unavailable',exact=True)).to_be_disabled()
                scan(f'workflow-unavailable-{width}')
                page.get_by_role('button',name='Cancel example draft',exact=True).click()
                expect(page.locator('.demo-stack [role="status"]')).to_contain_text('Nothing was submitted or stored')
        print(f'PASS public pages, demos, failure and safe-rendering journeys, axe and responsive checks: {width}px',flush=True)

    checked = set()
    for route in ['/', '/partners/', '/demo/', '/privacy/']:
        page.goto(BASE + route)
        for href in page.locator('a[href]').evaluate_all('(els)=>els.map(e=>e.getAttribute("href"))'):
            if not href.startswith(('/', '#')) or href in checked:
                continue
            checked.add(href)
            url = BASE + (href if href.startswith('/') else route + href)
            assert page.request.get(url.split('#')[0]).status == 200, href
            if '#' in url:
                page.goto(url)
                assert page.locator('[id]').evaluate_all('(els,id)=>els.some(e=>e.id===id)',url.split('#',1)[1]), href
    for route in ['/login','/redirect','/auth/callback','/dev/sign-in','/dashboard','/administration','/admin','/documents','/workspaces','/api/v1/workspaces','/api/v1/dev/token','/api/health','/.env']:
        response=page.request.get(BASE + route)
        assert response.status == 404, (route,response.status)
        assert "connect-src 'none'" in response.headers['content-security-policy']
    assert page.request.post(BASE+'/api/v1/dev/token',data={}).status in [404,405]
    assert page.request.get(BASE+'/social-preview.png').status == 200
    assert not errors, errors
    assert not console_errors, console_errors
    assert not failures, failures
    assert all(urlparse(url).netloc == urlparse(BASE).netloc for url in requests), 'Unexpected external/backend browser request'
    (OUT/'summary.json').write_text(json.dumps({'base_url':BASE,'scans':scans,'violations':0,'runtime_errors':errors,'console_errors':console_errors,'failed_requests':failures,'internal_links':len(checked),'widths':[1440,1024,768,390]},indent=2))
    print(f'PASS {scans} axe scans; internal links, email recipient, private-route isolation, no backend/external browser requests',flush=True)
    browser.close()
