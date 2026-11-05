import { ContactEmail } from '../components/contact-email';
import { Architecture } from '../components/architecture';
import { DemoShowcase } from '../components/demos';
import { Journey } from '../components/journey';
import { EmailCTA, Eyebrow, Icon } from '../components/primitives';
import { capabilities, emailLink, roadmap, REFERENCE } from '../lib/content.ts';
import { previewLink } from '../lib/demo.ts';

export default function Home() {
    return <>
        <section className="hero"><div className="container hero-grid">
            <div className="hero-copy">
                <span className="release-label"><span aria-hidden="true"/>Early Access · Synthetic Product Preview</span>
                <h1><span className="hero-product-name">SecureKnow</span><span className="hero-positioning">The Trust and Action Layer for <em>Enterprise AI</em></span></h1>
                <p className="hero-lead">Help your organisation turn approved knowledge into evidence-backed AI answers, policy-checked decisions and human-controlled workflows.</p>
                <p className="hero-tagline">Trusted Knowledge. Verified Decisions. Authorised Action.</p>
                <div className="button-row"><a className="button" href="/demo/#product-preview">Explore Interactive Demo<Icon name="arrow"/></a><a className="button outline-light" href="/partners/">Partner With SecureKnow</a></div>
                <a className="hero-roadmap" href="#progress">View Development Roadmap<Icon name="arrow"/></a>
                <div className="hero-principles"><span><Icon name="shield"/>Permission-aware by design</span><span><Icon name="people"/>Human-controlled action</span></div>
            </div>
            <DemoShowcase compact/>
        </div><div className="container hero-bottom"><span>KNOW → VERIFY → APPROVE → ACT → PROVE</span><span>Explore the product direction. No live AI or real execution.</span></div></section>
        <section className="section compact-section"><div className="container problem-row">
            <div><Eyebrow>The enterprise challenge</Eyebrow><h2>Useful intelligence.<br/>Clear boundaries.</h2></div>
            <div><span className="problem-index">01</span><h3>Scattered knowledge</h3><p>People need current guidance without opening access to everything.</p></div>
            <div><span className="problem-index">02</span><h3>Unverified decisions</h3><p>A convincing answer still needs evidence and an applicable business rule.</p></div>
            <div><span className="problem-index">03</span><h3>Uncontrolled action</h3><p>Consequential work needs explicit authority, human oversight and a confirmed outcome.</p></div>
        </div></section>
        <section id="platform" className="section surface"><div className="container">
            <div className="section-heading"><div><Eyebrow>Explore SecureKnow</Eyebrow><h2>Experience the trust chain.</h2></div><p>Try deterministic, fictional examples. Local engineering foundations and planned capabilities are clearly separated.</p></div>
            <div className="bento">{capabilities.map((item,index)=><article key={item.name} className={'capability capability-'+index}>
                <div className="capability-top"><span className="icon-tile"><Icon name={item.icon}/></span><span className={'badge '+(index<3?'local-badge':'')}>{item.status}</span></div>
                <h3>{item.name}</h3><p>{item.text}</p><a href={previewLink(item.preview)} className="inline-link">Try {item.name}<Icon name="arrow"/></a>
            </article>)}</div>
            <div className="agent-preview-links">
                <a href={previewLink('workflow')}><Icon name="workflow"/><span><strong>Workflow Automation Agent</strong><span>Prepare a sample request. Inspect the approval boundary.</span></span><Icon name="arrow"/></a>
                <a href={previewLink('monitoring')}><Icon name="monitor"/><span><strong>Knowledge Monitoring Agent</strong><span>Explore review dates and simulated alerts.</span></span><Icon name="arrow"/></a>
            </div>
            <a className="inline-link section-end-link" href={previewLink('research')}>Explore AI and Agent Previews<Icon name="arrow"/></a>
        </div></section>
        <section id="journey" className="section journey-section"><div className="container">
            <div className="section-heading"><div><Eyebrow>Know → Verify → Approve → Act → Prove</Eyebrow><h2>Every step has a trust boundary.</h2></div><p>A useful answer should become an authorised action only through explicit checks and human control.</p></div><Journey/>
        </div></section>
        <section className="section security-section" id="security"><div className="container security-grid">
            <div><Eyebrow>Security and governance</Eyebrow><h2>AI proposes.<br/>Trusted services enforce.</h2><p>Permission checks happen before evidence enters AI context. Sensitive actions require explicit authority. The model cannot grant itself access.</p><a href={previewLink('policy')} className="inline-link">See the Policy Decision Preview<Icon name="arrow"/></a></div>
            <Architecture/>
        </div><div className="container architecture-note"><p>Planned integrations: Microsoft Foundry and Azure AI Search for embeddings, hybrid retrieval and grounded answers. Bounded orchestration, secure tools, LLMOps and AgentOps still require live evaluation.</p><a href={REFERENCE}>Read the Reference Architecture<Icon name="arrow"/></a></div></section>
        <section className="section compact-section surface" id="use-cases"><div className="container">
            <div className="section-heading"><div><Eyebrow>Practical use cases</Eyebrow><h2>Built around the work.</h2></div><p>The intended first workflow is a SecureKnow-native internal IT support request, with no automated access provisioning.</p></div>
            <div className="use-cases">{[['IT','Guidance to a reviewed support request'],['HR','Find current employee guidance'],['Finance','Understand expense and access rules'],['Operations','Compare procedures and identify gaps'],['Compliance','Trace evidence and policy decisions'],['Leadership','Research with visible sources']].map(([name,text])=><article key={name}><h3>{name}</h3><p>{text}</p></article>)}</div>
        </div></section>
        <section className="section" id="progress"><div className="container">
            <div className="section-heading"><div><Eyebrow>Development progress</Eyebrow><h2>What works today.<br/>What comes next.</h2></div><p>The public demonstrations are synthetic. Locally tested foundations do not establish production readiness or live Microsoft integration.</p></div>
            <div className="roadmap-grid">{roadmap.map((item,index)=><article key={item.title} className={'roadmap-card '+item.state}><span className="roadmap-number">0{index+1}</span><h3>{item.title}</h3><ul>{item.items.map(text=><li key={text}>{text}</li>)}</ul></article>)}</div>
            <div className="pilot-requirements"><h3>Before an enterprise pilot</h3><p>Verify real organisational Microsoft sign-in, explicit membership, live provider behaviour, evaluation criteria and operational controls. No enterprise customers, certifications or production readiness are claimed.</p><a className="inline-link" href={REFERENCE}>Inspect the engineering foundations<Icon name="arrow"/></a></div>
        </div></section>
        <section className="section" id="contact"><div className="container contact-card">
            <div><Eyebrow>Partners, sponsors and pilots</Eyebrow><h2>Help make enterprise AI<br/>worthy of trust.</h2><p>Bring technology expertise, infrastructure support, a pilot use case or research insight to a focused next step.</p><div className="button-row"><a href="/partners/" className="button">Explore Partnerships<Icon name="arrow"/></a><EmailCTA kind="pilot" secondary>Join the Pilot</EmailCTA></div></div>
            <div className="contact-details"><h3>Start a conversation.</h3><ContactEmail kind="general"/><p>Email opens in your own email application. This site does not send messages or collect enquiries.</p><a className="inline-link" href={emailLink('demo')}>Request a Demo<Icon name="arrow"/></a><a className="inline-link" href={emailLink('support')}>Contact Support<Icon name="arrow"/></a></div>
        </div></section>
    </>;
}
