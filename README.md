# SWKGrowth

![SWKGrowth landing preview](docs/landing-preview.jpg)

A branded real estate growth platform concept, built from the supplied SWKGrowth brief and authentic SWK Properties assets. React 19, TypeScript, Vite, Lucide, locally served Instrument Sans and Plus Jakarta Sans.

## Run

Requires Node.js 22.12+ (or 24 LTS).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The public site is `/`; the demo workspace is `/#/app`. Hash navigation works on static hosts without route rewrites. Vercel build configuration is included. Deploy the `dist/` output on a static host, or connect this repository to Vercel. No live deployment or domain is configured by this repository.

## What works

- Responsive branded landing page with a CSS glass-block composition over source Dubai imagery; original SWKGrowth identity and unmodified SWK Properties partner logo.
- All five authentic partner portraits, exact names, titles and approved source biographies; portfolio showcase with source attribution and original property links.
- Editorial reading dialogs, proposed pricing with monthly/annual billing, consultation email preparation with consent, and a clearly labelled scripted guide with a WhatsApp handoff.
- Browser-local demo workspace: overview, clients, projects, campaigns, synthetic leads, task create/edit/complete/delete, search, status filtering, editable record details, project checklists, client associations, reporting period/metric selectors, SVG charts, widget selection and drag/keyboard reordering.
- Twelve deterministic agent templates, role-aware internal approval/rejection, source/confidence labels and a local audit trail. No external action executes on approval.
- 622-city programme explorer (tier, wave, languages, time-zone posting windows, 12 content pillars per city), lead-engine simulator and role policy matrix, city planning canvases with local persistence and text export, an illustrative ROI calculator, a source-aware property truth passport checklist, evidence ledger, criteria-based property matching, experiment backlog and what-if scenario calculator.
- Local JSON and safe CSV export, destructive-action confirmation, empty states, native modal focus trapping/Escape, semantic controls, keyboard focus and reduced-motion support.

## SWK lead engine (internal)

Internal use by SWK Properties: a consented lead pipeline that feeds SWK OS (`os.swkpropertiesuae.com`).

| Need | Where |
| --- | --- |
| The plan, workflow, city programme, KPIs, roadmap | [`docs/GROWTH-PLAYBOOK.md`](docs/GROWTH-PLAYBOOK.md) |
| Branded report (open HTML or the PDF) | `reports/growth-lead-engine/index.html`, [`docs/SWK-Growth-Lead-Engine-Report.pdf`](docs/SWK-Growth-Lead-Engine-Report.pdf) (`npm run report`, `npm run report:pdf`) |
| SWK OS contract, field mapping, change requests | [`docs/OS-INTEGRATION.md`](docs/OS-INTEGRATION.md) |
| Five seats, permissions, verified OS behaviour, gaps | [`docs/ACCESS-CONTROL.md`](docs/ACCESS-CONTROL.md) |
| Consent, jurisdictions, claims register | [`docs/COMPLIANCE.md`](docs/COMPLIANCE.md) |
| 622 cities (tier, wave, language, time zone, channels) | `data/cities.json` (`npm run cities`), seed in `src/growth/city-seed.mjs` |

Run it (Node 22+, no extra dependencies):

```sh
npm run growth -- cities --tier 1                    # list the city programme
npm run growth -- brief in-kochi                      # content brief for one city
npm run growth -- import export.csv --channel facebook --country IN --basis enquiry   # dry run
npm run growth -- signal "Looking to buy an off-plan flat in Dubai" --channel x       # intent signal check
npm run growth -- roles                               # SWK OS role definitions
npm run growth -- serve                               # signed intake server (configure engine/.env.example)
```

Nothing is written to SWK OS unless `--send` or `OS_SEND=true` is set. The engine never scrapes: leads come from enquiries and opt-ins, and public posts become prompts for a person to reply publicly. Access is limited to five seats (Owner, Manager, BDM, IT Admin, one Agent). The browser workspace only previews this policy; enforcement is in SWK OS and the server. **Keep this repository private.**

## Scope and honesty

This is a **working frontend demo**, not a production SaaS backend. All workspace data is synthetic and browser-local. Workspace selectors are presentation filters, not tenant isolation. Role selectors and checks demonstrate approval logic and are not secure access control. The browser app has no authentication, AI provider, live analytics, inventory feed, payments, email sending or immutable audit service. The Node lead engine in `engine/` can write to SWK OS when configured (see above) and has been exercised against a local copy of SWK OS, not production. Nothing in this repository scrapes social media. The guide is scripted and agent drafts are deterministic templates.

Prices are proposed from the brief, not purchasable subscriptions. The brief's certification, SLA, launch-history, customer-result, market-statistic and integration claims are not repeated as facts. Property prices, availability and yields are omitted. Source-derived project records are not independently verified live listings. No guarantees of leads, sales or returns are made. Partner contact details are sourced from its repository. SWKGrowth is clearly distinguished from the real estate partner.

Before production: implement server-side authentication/authorization and tenant isolation; replace local state with a secured database; configure authorised integrations server-side; obtain current inventory, image permissions and legal/privacy review; confirm commercial terms, taxes and the production domain; perform assistive-technology and production security audits. Never put secrets in `VITE_` environment variables.

See [asset provenance](docs/ASSET-PROVENANCE.md), [implementation coverage](docs/IMPLEMENTATION.md), and [verification](docs/VERIFICATION.md).
