export function validateEnvironment(env) {
    const forbidden = /^(?:NEXT_PUBLIC_(?!SHOWCASE_ORIGIN$)|ENTRA_|LOCAL_TEST_AUTH|DATABASE_URL$|API_TEST_DATABASE_URL$|MIGRATION_TEST_DATABASE_URL$|FOUNDRY_|AZURE_|OPENAI_|MSAL_)/i;
    if (Object.keys(env).some(key => forbidden.test(key) && env[key]?.trim())) {
        throw new Error('Private application configuration is forbidden in the public showcase. Remove it from this build environment.');
    }
    const value = env.NEXT_PUBLIC_SHOWCASE_ORIGIN;
    if((env.VERCEL_ENV==='production'||env.CONTEXT==='production')&&!value)throw new Error('Production showcase requires an explicitly approved public origin.');
    if (value) {
        const url = new URL(value);
        if (url.protocol !== 'https:' || value !== url.origin || url.username || url.password || url.pathname !== '/' || url.search || url.hash || /(?:localhost|\.local$|\.internal$|\.invalid$)/i.test(url.hostname) || !url.hostname.includes('.') || /^[\d.:\[\]]+$/.test(url.hostname)) {
            throw new Error('Showcase origin must be an approved public HTTPS origin.');
        }
    }
}
