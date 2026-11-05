'use client';
import { useRef, useState } from 'react';
import { Brand } from './primitives';
import { emailLink } from '../lib/content.ts';

export function Header() {
    const [open,setOpen]=useState(false);
    const toggle=useRef<HTMLButtonElement>(null);
    return <header className="site-header" onKeyDown={event=>{if(event.key==='Escape'&&open){setOpen(false);toggle.current?.focus();}}}><div className="container header-row"><Brand/><button className="menu-toggle" ref={toggle} type="button" aria-controls="public-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close menu':'Menu'}<span aria-hidden="true">{open?'×':'☰'}</span></button><nav id="public-navigation" className={`public-nav ${open?'is-open':''}`} aria-label="Main" onClick={()=>setOpen(false)}><a href="/#platform">Platform</a><a href="/demo/">Interactive Preview</a><a href="/#progress">Roadmap</a><a href="/partners/">Partners</a><a href={emailLink('demo')} className="button nav-cta">Request a Demo</a></nav></div></header>;
}
