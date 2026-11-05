import type { MetadataRoute } from 'next';
export const dynamic='force-static';
export default function robots():MetadataRoute.Robots {
    const origin=process.env.NEXT_PUBLIC_SHOWCASE_ORIGIN;
    const published=Boolean(origin)&&process.env.VERCEL_ENV!=='preview';
    return {rules:{userAgent:'*',...(published?{allow:'/'}:{disallow:'/'})},...(published?{sitemap:`${origin}/sitemap.xml`}:{})};
}
