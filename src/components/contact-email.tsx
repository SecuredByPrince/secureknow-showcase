'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACT, emailLink, subjects } from '../lib/content.ts';

export function ContactEmail({kind='general'}:{kind?:keyof typeof subjects}) {
    const [status,setStatus]=useState('');
    const [fallback,setFallback]=useState(false);
    const input=useRef<HTMLInputElement>(null);
    useEffect(()=>{if(fallback){input.current?.focus();input.current?.select();}},[fallback]);
    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(CONTACT);
            setFallback(false);
            setStatus('Email address copied.');
        } catch {
            setFallback(true);
            setStatus('Automatic copy is unavailable. The address is selected below; copy it manually.');
        }
    }
    return <div className="email-contact"><a className="contact-email" href={emailLink(kind)}>{CONTACT}</a><button className="text-button copy-email" type="button" onClick={copyEmail}>Copy Email Address</button><span className="small" role="status" aria-live="polite">{status}</span>{fallback&&<div className="copy-fallback"><label>Email address to copy<input ref={input} readOnly value={CONTACT} onFocus={event=>event.currentTarget.select()}/></label><button type="button" className="text-button" onClick={()=>{input.current?.focus();input.current?.select();}}>Select email address</button></div>}</div>;
}
