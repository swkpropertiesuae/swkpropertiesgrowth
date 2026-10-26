# SWK Growth Playbook

Internal. Owner: Owner / Manager. Last updated 26 October 2026.

Goal: a steady, measurable flow of **organic, consented** property leads from 600+ cities (UAE home market plus Tier 1 and Tier 2 source markets), scored, routed to the right person and recorded in SWK OS (`os.swkpropertiesuae.com`), with every lead traceable to the channel, city and content that produced it.

Everything in this document is a plan and a set of defaults to test. There are **no measured conversion figures** here because none exist yet; the first 90 days produce them (section 9).

---

## 1. What we will and will not do

| We do | We do not |
| --- | --- |
| Publish useful, city-specific content and let people opt in (comment keyword, WhatsApp click-to-chat, instant forms, landing pages) | Scrape personal profiles, friend lists, group member lists or private messages |
| Listen to **public** posts that state buying intent, then have a person reply publicly from the brand account | Auto-DM or cold-call people who only posted publicly |
| Import lead exports from platforms and portals where the person asked to be contacted | Buy or rent contact lists, or message people who never interacted with us |
| Keep consent evidence (wording, time, source URL) with each lead | Mark anyone "Opted in" without evidence |
| Use only claims that sit on the claims register with a source and date | Promise returns, prices or availability we cannot source |

Why scraping is out: it breaches platform terms (account and ad-account bans end the whole programme), it collects personal data without a lawful basis under UAE PDPL and the laws of the lead's own country, and the leads it produces convert badly because nobody asked to hear from us. The listening route below gives the same visibility of intent without those costs. Details: `docs/COMPLIANCE.md`.

## 2. The system in one picture

```
 CONTENT (12 pillars x 622 cities, localised)          LISTENING (public intent posts)
   Instagram, TikTok, YouTube, LinkedIn, X,              RedReplier / SocialListeningAPI
   Facebook, Telegram, WhatsApp channel, SEO pages       -> signal queue -> person replies publicly
                  |                                                     |
                  v                                                     v
 CAPTURE  comment-keyword -> DM opt-in, click-to-WhatsApp, Meta instant forms,
          city landing pages, ROI worksheet, portal enquiries, events, referrals
                  |
                  v
 GROWTH ENGINE (engine/, src/growth/)
   normalise -> consent check -> dedupe -> score -> route
                  |
                  v
 SWK OS CRM  POST /api/e/leads  (Bearer key, "Growth Sync" service user)
   owner_id = Agent | BDM    notes = [SWKGrowth] block (channel, city, UTM, score, consent)
                  |
                  v
 FOLLOW-UP in OS: activities, viewings, opportunities, deals
                  |
   OS webhook -> /intake/os-webhook -> attribution ledger -> weekly report
```

## 3. Lead workflow (stage by stage)

| # | Stage | What happens | Owner | Target |
| --- | --- | --- | --- | --- |
| 1 | Capture | Person enquires or opts in; consent text, time and URL stored | Automation | immediate |
| 2 | Normalise | Phone to E.164, e-mail check, city/country matched to the city list | Engine | seconds |
| 3 | Consent gate | No enquiry and no consent = signal only, never a CRM lead | Engine | seconds |
| 4 | Dedupe | Same phone or e-mail merges into the existing OS lead and adds a "repeat enquiry" note | Engine | seconds |
| 5 | Score | 0–100, explainable (reasons stored in OS notes). Bands: hot ≥ 65, warm ≥ 35, nurture ≥ 10 | Engine | seconds |
| 6 | Route | Hot/warm to Agent if on shift and under capacity, else BDM. Budget ≥ AED 5M goes to BDM, Manager informed. Nurture to opted-in WhatsApp sequence | Engine | seconds |
| 7 | First contact | Hot: 5 min. Warm: 30 min. Nurture: next day | Agent / BDM | SLA tracked in OS |
| 8 | Qualify | Budget, timeline, purpose (investment / residence / residency visa), cash or mortgage, decision makers | Agent / BDM | within 48 h |
| 9 | Viewing | In person or virtual; OS activity logged | Agent | per lead |
| 10 | Offer to close | OS opportunity, Form A/F, DLD steps handled in OS | Operations | per deal |
| 11 | Nurture and reactivate | Lost or quiet leads re-engaged only if opted in; lost reason recorded | BDM | monthly |

Hand-offs are in OS, not chat. A lead with no owner or no first activity inside its SLA shows on the Manager's "needs attention" list.

## 4. Lead sources: how we generate volume without scraping

Ordered by expected effort-to-lead ratio; every figure is something to **measure**, not a forecast.

| Source | Mechanism | Consent basis | OS source value |
| --- | --- | --- | --- |
| Click-to-WhatsApp from every post, bio and QR | `wa.me` link with a source code in the pre-filled text; OS already auto-creates WhatsApp leads | Enquiry | WhatsApp |
| Comment-keyword opt-in ("comment GUIDE") | Official Messenger/Instagram API sends the guide after the comment | Consent (the comment) | Other |
| Meta instant forms (organic lead magnets, later paid) | Webhook `/intake/meta` fetches the lead; consent checkbox mapped to OS | Enquiry + consent if ticked | Other |
| City landing pages (one per city, language-matched) | Signed `/intake/form` endpoint | Enquiry | Website |
| ROI worksheet and payment-plan comparator | Gated by phone or e-mail; user's own numbers | Enquiry | Website |
| Launch watchlist (WhatsApp channel, e-mail) | Opt-in, one message a month | Consent | WhatsApp / Email campaign |
| Residency eligibility checklist | PDF behind a short form | Enquiry | Website |
| Live Q&A and webinars per language cluster | Registration form, replay gated | Enquiry | Other |
| YouTube explainers with pinned WhatsApp and form links | Descriptions and chapters carry the CTA | Enquiry | Other |
| LinkedIn thought leadership and events (Tier 1 investor cities) | Lead-gen form, event registrations | Enquiry | LinkedIn |
| Public intent listening (X, Reddit, Instagram, Google) | Signal queue, public reply, opt-in link | None until they opt in | n/a until opted in |
| Portal enquiries (Property Finder, Bayut, Dubizzle) | CSV import or portal e-mail parsing | Enquiry | Property Finder / Bayut / Dubizzle |
| Referral programme with existing clients | Tracked code; reward policy approved by Owner | Consent from referrer; referee contacted only after they agree | Referral |
| Exhibitions and roadshows | Badge-scan CSV, consent printed on the form | Enquiry | Exhibition / event |
| Developer co-marketing | Joint launch pages and webinars | Enquiry | Other |
| Google Business Profile and reviews (UAE office) | Calls, messages and direction requests | Enquiry | Inbound call / Other |
| Remarketing (consented lists only) | Hashed e-mail custom audiences | Consent | n/a |
| Partner and agent networks | Referral fee agreed in writing | Enquiry | Agent network |

Volume comes from breadth (many cities, many opt-in doors) plus speed to lead, not from collecting data people did not give.

## 5. The city programme

`data/cities.json` is generated from `src/growth/city-seed.mjs`: **622 cities, 115 countries, 66 content languages**, each with tier, wave, time zone, currency, languages (regional where it matters: Malayalam for Kochi, Tamil for Chennai, and so on), right-to-left flag and an organic channel stack.

| Tier | Meaning | Cities |
| --- | --- | --- |
| 0 | UAE home market | 8 |
| 1 | Planning priority: major investor hubs and large UAE-connected diaspora centres | 63 |
| 2 | Everything else on the list | 551 |

Tier 1 is a **planning assumption**, not a measurement. After 90 days, re-rank every city from our own CRM data (leads, qualified rate, deals) and move cities between tiers.

| Wave | Weeks | Scope |
| --- | --- | --- |
| 0 | always on | UAE cities |
| 1 | 1–4 | All Tier 1 cities (63) |
| 2 | 5–8 | Tier 2 in South Asia, GCC, Levant/Iraq/Iran, North Africa, Turkey and Cyprus (150) |
| 3 | 9–12 | Tier 2 in Europe, Russia/CIS, Central Asia/Caucasus, Sub-Saharan Africa (245) |
| 4 | 13–16 | Tier 2 in East and Southeast Asia, North America, Latin America, Oceania (156) |

**How 622 cities stay feasible and not spam.** One person cannot produce 622 bespoke feeds. So:

1. Tier 0/1 cities get localised content on their own tag (`#KochiToDubai`) at 3 posts a week on the primary channel plus a monthly live.
2. Tier 2 cities are served by **language-cluster** accounts and a city landing page; each page must contain something genuinely specific (local currency framing, language, time-zone windows, local questions from real enquiries). Pages that only swap the city name are not published: search engines treat that as scaled low-value content and it can hurt the whole site.
3. Every city brief is generated by `node engine/cli.mjs brief <city-id>` and reviewed by a human fluent in the language before it is used.
4. A city graduates to its own channel only when it produces enough leads to justify it (threshold set at the 90-day review).

Channel availability differs by market and changes (for example, some Western platforms are restricted in Russia and mainland China). The archetype table in `src/growth/city-seed.mjs` records the starting stack and local-platform notes; confirm availability and legality before committing budget.

## 6. Content system

Twelve evergreen pillars (see `src/growth/content.mjs`): buying process, off-plan payment plans, your-numbers ROI worksheet, residency options, moving funds, meet a consultant, community guides, viewing-trip planner, escrow and RERA protections, live Q&A, launch watchlist, rent vs buy.

Rules:

* **ROI content shows a worksheet, never a promise.** The user enters price, rent and costs in their own currency; the output is arithmetic. No appreciation forecast, no "guaranteed" or "risk-free".
* Property facts (price, payment plan, handover, developer) come from the claims register with a source and a date. The repository's `brand.json` records are a snapshot, not live availability.
* Every property ad carries the regulator-required advertising permit number and QR code (confirm current rules with RERA/DLD before publishing).
* Native-language review before publishing; right-to-left layout checked for Arabic, Persian and Urdu.
* UTM convention: `utm_source=<channel>&utm_medium=<organic|lead_ad|listing>&utm_campaign=<cityid>-<pillar>-<yyyymm>`.

Weekly rhythm: Monday brief and approvals, Tuesday–Thursday publish, Friday live/Q&A and signal replies, Saturday review.

## 7. Roles

| Role | Responsibility | Never |
| --- | --- | --- |
| Owner | Strategy, budgets, approves Tier 3 items, creates API keys and role changes | |
| Manager | Weekly review, approves Tier 2, exports, escalations | Changes keys or roles |
| BDM | Triage, assignment, campaigns, content calendar, signal replies, nurture | Exports data |
| IT Admin | Integrations health, deployment, logs, backups | Reads lead PII, mints keys, changes roles |
| Agent (one seat) | Works assigned leads: calls, WhatsApp, viewings, qualification notes | Sees other people's leads (policy; see OS gap in `docs/ACCESS-CONTROL.md`) |

## 8. Capacity: one agent, many cities

Two facts shape the design:

1. **Time zones.** Enquiries cluster in the local evening (taken as 19:00–22:00). With a 09:00–19:00 Dubai shift, 47 of the 71 Tier 0/1 cities (and 426 of 622 overall) have **no overlap** with the agent's working hours. Moving the shift to 14:00–23:00 Dubai time leaves 10 of 71 Tier 0/1 cities (140 of 622) uncovered. Recommendation: set the single agent's shift to 14:00–23:00 and have the BDM cover mornings. Computed with `windowInGst` and `overlapMinutes` for 26 Oct 2026; daylight-saving changes shift Europe and North America by an hour.
2. **Volume.** One agent has a hard ceiling. The router caps the agent at 15 active leads (editable), sends warm leads to the BDM above 70 % of that, and sends nurture leads to opted-in WhatsApp sequences. If hot leads arrive faster than the agent and BDM can answer, the correct response is to slow content distribution or add a seat, not to let SLAs slip silently.

## 9. Measurement

Track weekly, by city, channel and pillar (all from OS plus the engine ledger):

* Reach and engagement per post (platform analytics)
* Opt-ins / enquiries (leads created, merged, rejected, signal-only)
* Cost per lead (organic: staff hours ÷ leads; paid, if ever added: spend ÷ leads)
* Speed to first contact versus SLA
* Qualified rate, viewing rate, offer rate, deals, GCI and **revenue per city**
* Lost-reason distribution

**Funnel worksheet.** Fill from measured data only:

| Stage | Weeks 1–4 | Weeks 5–8 | Weeks 9–12 |
| --- | --- | --- | --- |
| Posts published | | | |
| Enquiries + opt-ins | | | |
| Qualified | | | |
| Viewings | | | |
| Offers | | | |
| Deals | | | |

Decision rules at each 4-week review (set the numeric thresholds after the first month, from the baseline): **scale** a city or pillar that beats the median on qualified leads per hour of effort; **hold** one near the median; **stop** one that is below the floor for two consecutive reviews. Write the threshold and date down before the test starts.

## 10. 16-week roadmap

| Weeks | Deliverables |
| --- | --- |
| 0 (before launch) | Legal review of consent text and jurisdictions; claims register; advertising-permit workflow; OS roles and Growth Sync key created by the Owner; engine dry-run on a sample export |
| 1–4 (Wave 1) | Tier 0/1 briefs, 12 pillars in the top five languages, WhatsApp click-to-chat everywhere, landing pages for Tier 1, first instant form, listening queries live, SLA dashboard in OS |
| 5–8 (Wave 2) | Tier 2 clusters South Asia, GCC, Levant, North Africa, Turkey; regional-language reels; webinar series; portal import; referral programme |
| 9–12 (Wave 3) | Europe, CIS, Africa clusters; investor-grade PDF guides; first 90-day re-ranking of tiers |
| 13–16 (Wave 4) | Asia-Pacific, Americas, Oceania; automate weekly report; decide on paid amplification only for proven city/pillar pairs |

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| Platform account or ad-account suspension | No scraping, no automation outside official APIs, keep backup admins |
| Consent or data-protection breach | Consent gate in the engine, evidence stored, legal review per jurisdiction, 30-day purge of unconverted signals |
| Misleading property or return claims | Claims register, no return promises, regulator permit on every ad |
| One agent overwhelmed or absent | Capacity cap, BDM fallback, shift aligned to enquiry hours, automated opt-in nurture |
| Thin or duplicated city content | Uniqueness rule, human review, cluster approach |
| Credential or key misuse in SWK OS | Owner-only key creation, low-privilege service user, rotation every 90 days |
| Sanctions or source-of-funds exposure for some markets | AML/sanctions screening in OS before any transaction; no exceptions for volume |
