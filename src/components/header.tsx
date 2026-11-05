'use client';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './primitives';
import { emailLink } from '../lib/content.ts';

export function Header() {
    const [open,setOpen]=useState(false);
    const toggle=useRef<HTMLButtonElement>(null);
    const header=useRef<HTMLElement>(null);
    useEffect(()=>{
        if(!open)return;
        const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!header.current?.contains(event.target))setOpen(false);};
        const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}};
        document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
        return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
    },[open]);
    return <header ref={header} className="site-header" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}><div className="container header-row"><Brand/><button className="menu-toggle" ref={toggle} type="button" aria-controls="public-navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Close menu':'Menu'}<span aria-hidden="true">{open?'×':'☰'}</span></button><nav id="public-navigation" className={`public-nav ${open?'is-open':''}`} aria-label="Main" onClick={()=>setOpen(false)}><a href="/#platform">Platform</a><a href="/demo/#product-preview">Interactive Preview</a><a href="/#progress">Roadmap</a><a href="/partners/">Partners</a><a href={emailLink('demo')} className="button nav-cta">Request a Demo</a></nav></div></header>;
}
