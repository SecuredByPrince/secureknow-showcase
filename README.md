# SecureKnow 3.0 public showcase

**SecureKnow ? The Trust and Action Layer for Enterprise AI.**

Trusted Knowledge. Verified Decisions. Authorised Action.

Explore how authorised organisational knowledge can support trusted answers, verified
decisions and controlled business actions: **Know ? Verify ? Approve ? Act ? Prove**.

This standalone Next.js static website presents seven synthetic product previews and
partnership opportunities. It includes no enterprise login, private workspace, backend
connection, live AI inference or real workflow execution. Locally tested foundations and
planned capabilities are labelled separately.

[Reference architecture and educational examples](https://github.com/SecuredByPrince/secureknow-reference-architecture)

## Run locally

Use Node.js 24 and npm:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

The production export is served at http://127.0.0.1:3101 without a backend.
`npm run dev` uses the same port; run only one server at a time.
`output: 'export'` generates `out/`. There are no API handlers or server actions.
Full-document links deliberately avoid client-side RSC network requests.

## Product previews

AI Knowledge Assistant, Document Governance, Policy Decisions, Knowledge Research Agent,
Workflow Automation Agent, Knowledge Monitoring Agent and Trust Passport illustrate the
product direction with fictional data. Drafts stay in page memory. No action is executed;
future agents and live Microsoft Foundry/Azure AI Search integrations remain unverified.

## Partners and contact

Visit `/partners/` for Azure/cloud and model-compute sponsorship, mentorship, security and
architecture review, enterprise pilots, product collaboration and strategic funding.
Official contact for all enquiries: **securedbyprince@gmail.com**.
Contact links open the visitor's email application with the relevant subject and suggested
message for partnership, sponsorship and demo requests. A copy-email button supports
visitors without an email handler. There is no
contact form, email service, interest-list database, analytics or delivery confirmation.

## Deployment

Deploy only this showcase repository. Select Next.js, root `.`, production branch `main`,
Node.js 24, install `npm ci`, build `npm run build` and output `out`.
The only public configuration is `NEXT_PUBLIC_SHOWCASE_ORIGIN=https://<production-host>`
(no trailing slash). Production on Vercel requires it for canonical metadata and indexing.
Without an origin, local builds remain noindex; preview builds remain noindex.

Do not add private identity settings, service credentials, API rewrites or integrations.
The build/export checks reject private configuration, unexpected routes and sensitive
markers. Security headers in `vercel.json` block network APIs and form submission;
Next hydration requires inline script/style allowances. There is no eval allowance.
Preview deployments should use Vercel Authentication; the approved production domain is
public. Sponsorship-oriented commercial use requires an appropriate Vercel plan.

The Python browser QA helper uses the private workspace's existing Playwright/axe tooling;
`SHOWCASE_BASE_URL` selects the host under test. It is not part of the hosted website.
`release:prepare` is a private-workspace staging helper and performs no Git or deployment
operation. Publishing always requires reviewed source and secret/privacy checks.

## Netlify

The existing project is `secureknow-preview` in the `secured` team. Link only
`SecuredByPrince/secureknow-showcase`, branch `main`, with an empty base directory.
`netlify.toml` records `npm run build`, publish `out`, Node 24 and the public production
origin. `public/_headers` carries the same restrictive security policy as the local QA
server. There is no catch-all SPA rewrite or backend route. Netlify preview/branch
contexts remain noindex. Preserve the existing project URL when relinking repositories.
The Python reference repository is documentation and examples, not this website.
