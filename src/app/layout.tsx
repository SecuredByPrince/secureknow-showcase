import type { Metadata } from 'next';
import { Header } from '../components/header';
import { Footer } from '../components/primitives';
import './globals.css';
const origin=process.env.NEXT_PUBLIC_SHOWCASE_ORIGIN;
export const metadata:Metadata={
    metadataBase:new URL(origin??'https://secureknow.invalid'),
    title:{default:'SecureKnow — The Trust and Action Layer for Enterprise AI',template:'%s | SecureKnow'},
    description:'Turn authorised organisational knowledge into trusted answers, verified decisions and controlled business actions. Explore the SecureKnow early access product preview.',
    applicationName:'SecureKnow',
    alternates:{canonical:'/'},
    robots:{index:Boolean(origin)&&process.env.VERCEL_ENV!=='preview',follow:Boolean(origin)&&process.env.VERCEL_ENV!=='preview'},
    openGraph:{type:'website',locale:'en_GB',siteName:'SecureKnow',title:'SecureKnow — Trusted Knowledge. Verified Decisions. Authorised Action.',description:'The Trust and Action Layer for Enterprise AI. An early access product preview.',images:[{url:'/social-preview.png',width:1200,height:630,alt:'SecureKnow — The Trust and Action Layer for Enterprise AI'}]},
    twitter:{card:'summary_large_image',title:'SecureKnow — The Trust and Action Layer for Enterprise AI',images:['/social-preview.png']},
    icons:{icon:'/icon.svg'},
};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en-GB"><body><a className="skip-link" href="#main">Skip to content</a><Header/><main id="main">{children}</main><Footer/></body></html>;}
