import { defineConfig, globalIgnores } from 'eslint/config';
import vitals from 'eslint-config-next/core-web-vitals';
import ts from 'eslint-config-next/typescript';
// Full document navigation is deliberate: this backend-free export forbids fetch
// via connect-src 'none'. Next Link client transitions would request RSC payloads.
export default defineConfig([...vitals, ...ts, {rules:{'@next/next/no-html-link-for-pages':'off'}}, globalIgnores(['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'])]);
