import { validateEnvironment } from './scripts/environment.mjs';
validateEnvironment(process.env);
/** @type {import('next').NextConfig} */
const config = {
    output: 'export',
    trailingSlash: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    agentRules: false,
    turbopack: { root: import.meta.dirname },
};
export default config;
