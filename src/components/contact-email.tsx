'use client';

import { useState } from 'react';
import { CONTACT, emailLink, subjects } from '../lib/content.ts';

export function ContactEmail({kind='general'}:{kind?:keyof typeof subjects}) {
    const [status,setStatus]=useState('');
    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(CONTACT);
            setStatus('Email address copied.');
        } catch {
            setStatus(`Copy is unavailable here. Select the visible address and copy it: ${CONTACT}`);
        }
    }
    return <div className="email-contact"><a className="contact-email" href={emailLink(kind)}>{CONTACT}</a><button className="text-button copy-email" type="button" onClick={copyEmail}>Copy email address</button><span className="small" role="status" aria-live="polite">{status}</span></div>;
}
