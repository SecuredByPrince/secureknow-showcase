import type { ReactNode } from 'react';
import { CONTACT, emailLink, REFERENCE, subjects } from '../lib/content.ts';

const paths:Record<string,ReactNode> = {
    shield:<><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8 12 3 3 5-6"/></>,
    knowledge:<><path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H4V4Zm16 0h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h3V4Z"/></>,
    document:<><path d="M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6"/></>,
    policy:<><path d="m12 3 8 5v8l-8 5-8-5V8l8-5Z"/><path d="m8 12 3 3 5-6"/></>,
    research:<><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6m-3-3v6"/></>,
    passport:<><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 17h6"/></>,
    cloud:<><path d="M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10H6Z"/></>,
    people:<><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m2 10v-3a6 6 0 0 0-3-5"/></>,
    code:<><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/></>,
    growth:<><path d="M4 20V4m0 16h17M7 15l5-5 4 3 5-8m-5 0h5v5"/></>,
    workflow:<><rect x="3" y="3" width="7" height="6" rx="1"/><rect x="14" y="15" width="7" height="6" rx="1"/><path d="M6 9v9h8m-2-12h6v9"/></>,
    monitor:<><path d="M3 12h4l3-7 4 14 3-7h4"/></>,
    arrow:<><path d="M4 12h16m-6-6 6 6-6 6"/></>,
};
export function Icon({name,className=''}:{name:string;className?:string}) {return <svg aria-hidden="true" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]??paths.shield}</svg>;}
export function Brand() {return <a className="brand" href="/" aria-label="SecureKnow home"><span className="brand-mark"><Icon name="shield"/></span>SecureKnow<span className="brand-version">3.0</span></a>;}
export function EmailCTA({kind,children,secondary=false}:{kind:keyof typeof subjects;children:ReactNode;secondary?:boolean}) {return <a className={`button ${secondary?'secondary':''}`} href={emailLink(kind)}>{children}<Icon name="arrow"/></a>;}
export function Eyebrow({children}:{children:ReactNode}) {return <p className="eyebrow">{children}</p>;}
export function Footer() {return <footer className="footer"><div className="container footer-grid"><div><Brand/><p>The Trust and Action Layer for Enterprise AI.</p><p className="small">An early access product preview. No live organisational data.</p></div><nav aria-label="Footer"><a href="/demo/">Product previews</a><a href="/partners/">Partnerships</a><a href="/#progress">Development roadmap</a><a href={REFERENCE}>Reference architecture on GitHub</a></nav><div><h2>Let&apos;s build trust together.</h2><a className="contact-email" href={emailLink('partner')}>{CONTACT}</a><a href={emailLink('general')}>General Contact</a><a href={emailLink('support')}>Contact Support</a><a href="/privacy/">Privacy &amp; preview information</a></div></div><div className="container footer-bottom"><span>SecureKnow · Built with security at the foundation.</span><span>No customers, certifications or partnerships are implied.</span></div></footer>;}
