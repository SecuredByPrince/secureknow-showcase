import type { MetadataRoute } from 'next';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap {
    const origin=process.env.NEXT_PUBLIC_SHOWCASE_ORIGIN;
    if(!origin||(process.env.VERCEL_ENV==='preview'||['deploy-preview','branch-deploy'].includes(process.env.CONTEXT??'')))return [];
    return ['','/demo/','/partners/','/privacy/'].map(path=>({url:`${origin}${path}`}));
}
