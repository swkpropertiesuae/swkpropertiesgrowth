// Builds reports/growth-lead-engine/index.html (A4, print-ready; deliberately NOT under public/, so it is never deployed) from the live data modules so every number in the report is computed, not typed.
// Brand: SWK OS "Midnight & Champagne" (logo, skyline, Clash Display + General Sans copied from swkpropertiesOS).
import fs from "node:fs";
import { CITY_LIST, cityStats, windowInGst, overlapMinutes } from "../src/growth/cities.mjs";
import { ARCHETYPES } from "../src/growth/city-seed.mjs";
import { PILLARS, langName } from "../src/growth/content.mjs";
import { POLICY, ACTIONS, GROWTH_ROLES, osRoleDefinitions } from "../src/growth/access.mjs";
import { DEFAULT_SCORING } from "../src/growth/scoring.mjs";
import { DEFAULT_ROUTING } from "../src/growth/assign.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const stats = cityStats();
const today = "26 October 2026";

// ---- computed facts
const REF = new Date("2026-10-26T00:00:00Z");
const coverage = [["09:00–19:00", 540, 1140], ["12:00–21:00", 720, 1260], ["14:00–23:00", 840, 1380]].map(([label, s, e]) => {
  const sh = { start: s, end: e };
  const unc = (list) => list.filter((c) => overlapMinutes(windowInGst(c.tz, 19, 22, REF), sh) === 0).length;
  const t01 = CITY_LIST.filter((c) => c.tier <= 1);
  return { label, t01: unc(t01), t01n: t01.length, all: unc(CITY_LIST), alln: CITY_LIST.length };
});
const regions = Object.entries(stats.byRegion).sort((a, b) => b[1] - a[1]);
const tierName = { 0: "Tier 0 (UAE)", 1: "Tier 1", 2: "Tier 2" };

const table = (head, rows, cls = "") =>
  `<table class="${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
const callout = (title, body, kind = "") => `<aside class="callout ${kind}"><strong>${title}</strong><p>${body}</p></aside>`;
const bars = (items, max, fmt = (v) => v) =>
  `<div class="bars">${items.map(([l, v, sub]) => `<div class="bar"><span class="bl">${esc(l)}</span><span class="bt"><i style="width:${Math.max(2, (v / max) * 100)}%"></i></span><span class="bv">${fmt(v)}${sub ? ` <small>${esc(sub)}</small>` : ""}</span></div>`).join("")}</div>`;

// ---- sections
const sections = [];
const S = (id, title, html) => sections.push({ id, title, html });

S("summary", "Executive summary", `
<p class="lead">SWK Properties will generate its own leads by earning attention in 622 cities with useful, local content and by making it effortless to opt in. Every lead is checked for consent, scored, routed to the right person and written into SWK OS with its channel, city and reasons attached.</p>
<div class="stats">
  <div><b>${stats.total}</b><span>cities</span></div><div><b>${stats.countries}</b><span>countries</span></div>
  <div><b>${stats.languages}</b><span>content languages</span></div><div><b>5</b><span>access seats</span></div><div><b>16</b><span>weeks, 4 waves</span></div>
</div>
<h3>What we decided</h3>
<ul>
<li><b>Consented capture, not scraping.</b> Public posts that state buying intent become a prompt for a person to reply publicly. Nobody is added to the CRM unless they enquired or opted in. This protects the Instagram, Facebook, WhatsApp and Google accounts the whole programme depends on, and keeps us inside UAE PDPL and the laws of each lead's country.</li>
<li><b>One engine, one source of truth.</b> Normalise, consent-gate, dedupe, score and route in a single tested pipeline (33 automated tests) that writes into SWK OS through a low-privilege key.</li>
<li><b>Five seats only</b>: Owner, Manager, BDM, IT Admin and one Agent, each with least-privilege permissions.</li>
<li><b>Volume from breadth.</b> Twelve content pillars in 66 languages across 622 cities, 18 opt-in doors, and speed to lead.</li>
<li><b>No promises we cannot source.</b> No guaranteed returns; ROI content is a worksheet that runs on the visitor's own numbers.</li>
</ul>
${callout("Three findings you should act on", `
<b>1. SWK OS privilege escalation.</b> Any OS role with write access on the <i>admin</i> module can mint an API key that acts as the Admin user. We reproduced it on a local copy: a role with that access exported every lead. IT therefore gets read-only admin access and only the Owner creates keys.<br>
<b>2. The single agent cannot see only their own leads in OS.</b> OS has no row-level scoping for staff; the Agent can list all CRM leads.<br>
<b>3. A 09:00–19:00 agent shift misses the enquiry window in most cities.</b> ${coverage[0].t01} of ${coverage[0].t01n} Tier 0/1 cities have no overlap; a 14:00–23:00 shift cuts that to ${coverage[2].t01}.`, "warn")}
`);

S("principles", "Principles and boundaries", `
${table(["We do", "We do not"], [
  ["Publish useful city-specific content and let people opt in", "Scrape personal profiles, member lists or private messages"],
  ["Listen to <b>public</b> posts with buying intent; a person replies publicly", "Auto-DM or cold-call people who only posted publicly"],
  ["Import exports where the person asked to be contacted", "Buy or rent contact lists"],
  ["Store consent wording, time and URL with every lead", "Mark anyone “Opted in” without evidence"],
  ["Use claims that carry a source and a date", "Promise returns, prices or availability we cannot source"],
])}
<p>Scraping would breach platform terms (an account or ad-account ban ends the programme), collect personal data without a lawful basis, and produce leads who never asked to hear from us. The listening route gives visibility of intent without those costs.</p>`);

S("architecture", "System architecture", `
<svg viewBox="0 0 760 330" class="diagram" role="img" aria-label="Lead flow from content and listening through the Growth engine into SWK OS">
  <defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#14305c"/></marker></defs>
  <g font-family="General Sans, sans-serif" font-size="12" text-anchor="middle">
    <rect x="10" y="20" width="200" height="90" rx="14" fill="#fff" stroke="#d9d1c1"/><text x="110" y="45" font-weight="700" fill="#0b1a33">Content, 622 cities</text><text x="110" y="64" fill="#3a4660">12 pillars · local languages</text><text x="110" y="82" fill="#3a4660">Instagram · YouTube · TikTok</text><text x="110" y="98" fill="#3a4660">LinkedIn · X · Telegram · SEO</text>
    <rect x="10" y="130" width="200" height="70" rx="14" fill="#fff" stroke="#d9d1c1"/><text x="110" y="155" font-weight="700" fill="#0b1a33">Public listening</text><text x="110" y="175" fill="#3a4660">intent post → signal → human reply</text>
    <rect x="10" y="220" width="200" height="90" rx="14" fill="#fff" stroke="#d9d1c1"/><text x="110" y="245" font-weight="700" fill="#0b1a33">Opt-in doors</text><text x="110" y="265" fill="#3a4660">click-to-WhatsApp · instant forms</text><text x="110" y="281" fill="#3a4660">landing pages · portals · events</text><text x="110" y="297" fill="#3a4660">referrals · webinars</text>
    <rect x="280" y="90" width="210" height="150" rx="16" fill="#14305c"/><text x="385" y="120" font-weight="700" fill="#fff" font-size="14">Growth engine</text><text x="385" y="146" fill="#dcc8a2">normalise → consent gate</text><text x="385" y="166" fill="#dcc8a2">dedupe → score 0–100</text><text x="385" y="186" fill="#dcc8a2">route: Agent · BDM · nurture</text><text x="385" y="206" fill="#dcc8a2">signed intake · hashed ledger</text><text x="385" y="226" fill="#fff" font-size="11">engine/ · src/growth/</text>
    <rect x="560" y="60" width="190" height="210" rx="16" fill="#0b1a33"/><text x="655" y="92" font-weight="700" fill="#fff" font-size="14">SWK OS CRM</text><text x="655" y="118" fill="#dcc8a2">os.swkpropertiesuae.com</text><text x="655" y="148" fill="#fff">Lead + owner + consent</text><text x="655" y="168" fill="#fff">[SWKGrowth] note block</text><text x="655" y="188" fill="#fff">Activities · viewings</text><text x="655" y="208" fill="#fff">Opportunities · deals</text><text x="655" y="238" fill="#c9a96e" font-size="11">Bearer key · Growth Sync user</text>
    <path d="M210 65 L280 130" stroke="#14305c" stroke-width="2" fill="none" marker-end="url(#a)"/><path d="M210 165 L280 165" stroke="#14305c" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#a)"/><path d="M210 265 L280 200" stroke="#14305c" stroke-width="2" fill="none" marker-end="url(#a)"/>
    <path d="M490 165 L560 165" stroke="#14305c" stroke-width="2" fill="none" marker-end="url(#a)"/><path d="M655 270 C655 315 385 315 385 244" stroke="#c9a96e" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#a)"/><text x="520" y="325" fill="#9a7a42" font-size="11">status webhook closes the attribution loop</text>
  </g>
</svg>
<p>The listening path is dashed because it never creates a CRM lead on its own. A person replies publicly, and the lead enters through an opt-in door when the person chooses to.</p>`);

S("workflow", "Lead workflow", table(["#", "Stage", "What happens", "Owner", "Target"], [
  [1, "Capture", "Person enquires or opts in; consent text, time and URL stored", "Automation", "immediate"],
  [2, "Normalise", "Phone to E.164, e-mail check, city matched to the city list", "Engine", "seconds"],
  [3, "Consent gate", "No enquiry and no consent: signal only, never a CRM lead", "Engine", "seconds"],
  [4, "Dedupe", "Same phone or e-mail merges into the OS lead with a repeat-enquiry note", "Engine", "seconds"],
  [5, "Score", "0–100 with stored reasons. Hot ≥ " + DEFAULT_SCORING.hot + ", warm ≥ " + DEFAULT_SCORING.warm + ", nurture ≥ " + DEFAULT_SCORING.nurture, "Engine", "seconds"],
  [6, "Route", "Hot/warm to Agent when on shift and under capacity, else BDM; budget ≥ AED " + DEFAULT_ROUTING.vipBudgetAed.toLocaleString("en-US") + " to BDM with Manager informed", "Engine", "seconds"],
  [7, "First contact", "Hot " + DEFAULT_ROUTING.slaMinutes.hot + " min, warm " + DEFAULT_ROUTING.slaMinutes.warm + " min, nurture next day", "Agent / BDM", "SLA"],
  [8, "Qualify", "Budget, timeline, purpose, cash or mortgage, decision makers", "Agent / BDM", "48 h"],
  [9, "Viewing", "In person or virtual; activity logged in OS", "Agent", "per lead"],
  [10, "Offer to close", "Opportunity, Form A/F, DLD steps in OS", "Operations", "per deal"],
  [11, "Nurture / reactivate", "Opted-in sequences; lost reason recorded", "BDM", "monthly"],
]));

S("sources", "Lead sources: volume without scraping", table(["Source", "Mechanism", "Basis", "OS source"], [
  ["Click-to-WhatsApp", "wa.me link with source code on every post, bio and QR; OS already auto-creates WhatsApp leads", "Enquiry", "WhatsApp"],
  ["Comment-keyword opt-in", "“Comment GUIDE”; official API sends the guide", "Consent", "Other"],
  ["Meta instant forms", "Webhook fetches the lead; consent checkbox mapped", "Enquiry + consent", "Other"],
  ["City landing pages", "Signed form endpoint, one per city and language", "Enquiry", "Website"],
  ["ROI worksheet, payment-plan comparator", "Gated by phone or e-mail; visitor's own numbers", "Enquiry", "Website"],
  ["Launch watchlist", "WhatsApp channel or e-mail, one message a month", "Consent", "WhatsApp / Email"],
  ["Residency checklist", "PDF behind a short form", "Enquiry", "Website"],
  ["Live Q&A and webinars", "Registration per language cluster", "Enquiry", "Other"],
  ["YouTube explainers", "Pinned WhatsApp and form links, chapters", "Enquiry", "Other"],
  ["LinkedIn events and forms", "Tier 1 investor cities", "Enquiry", "LinkedIn"],
  ["Public intent listening", "Signal queue → public reply → opt-in link", "None until opt-in", "n/a"],
  ["Portal enquiries", "CSV import or e-mail parsing", "Enquiry", "Property Finder / Bayut / Dubizzle"],
  ["Referral programme", "Tracked code, Owner-approved reward policy", "Consent", "Referral"],
  ["Exhibitions and roadshows", "Badge-scan CSV with printed consent", "Enquiry", "Exhibition / event"],
  ["Developer co-marketing", "Joint launch pages and webinars", "Enquiry", "Other"],
  ["Google Business Profile", "Calls, messages, directions (UAE office)", "Enquiry", "Inbound call"],
  ["Remarketing", "Hashed e-mail audiences, consented lists only", "Consent", "n/a"],
  ["Partner and agent networks", "Written referral terms", "Enquiry", "Agent network"],
]));

S("cities", "The 622-city programme", `
<p>Generated from one seed file (<code>src/growth/city-seed.mjs</code>) into <code>data/cities.json</code>. Each city carries tier, rollout wave, IANA time zone, currency, content languages (regional where it matters, such as Malayalam for Kochi and Tamil for Chennai), a right-to-left flag and an organic channel stack for its market archetype.</p>
${table(["Tier", "Meaning", "Cities"], [["Tier 0", "UAE home market", stats.byTier[0]], ["Tier 1", "Planning priority: major investor hubs and large UAE-connected diaspora centres", stats.byTier[1]], ["Tier 2", "All other cities on the list", stats.byTier[2]]])}
${callout("Tier 1 is an assumption", "Tiers are a starting point, not a measurement. After 90 days every city is re-ranked on our own CRM data: leads, qualified rate and revenue per city.")}
<h3>Rollout waves</h3>
${table(["Wave", "Weeks", "Scope", "Cities"], [["0", "always on", "UAE cities", stats.byWave[0]], ["1", "1–4", "All Tier 1 cities", stats.byWave[1]], ["2", "5–8", "Tier 2: South Asia, GCC, Levant/Iraq/Iran, North Africa, Turkey & Cyprus", stats.byWave[2]], ["3", "9–12", "Tier 2: Europe, Russia/CIS, Central Asia & Caucasus, Sub-Saharan Africa", stats.byWave[3]], ["4", "13–16", "Tier 2: East & Southeast Asia, North America, Latin America, Oceania", stats.byWave[4]]])}
<h3>Cities by region</h3>
${bars(regions, regions[0][1])}
<h3>How 622 cities stay credible, not spam</h3>
<ol>
<li>Tier 0/1 cities get localised content on their own tag (for example <code>#KochiToDubai</code>): 3 posts a week on the primary channel plus a monthly live.</li>
<li>Tier 2 cities are served by <b>language-cluster</b> accounts plus a city page. A page must contain something genuinely local (currency framing, language, time-zone windows, real questions from enquiries). Pages that only swap the city name are not published.</li>
<li>Every brief is generated from data, then reviewed by a fluent human before use.</li>
<li>A city earns its own channel only when its results justify it at the 90-day review.</li>
</ol>
<h3>Market archetypes and starting channel stacks</h3>
${table(["Archetype", "Channels (priority order)", "Note"], Object.values(ARCHETYPES).map((a) => [esc(a.label), a.channels.join(" → "), esc(a.note)]))}
<p class="small">Channel availability changes by market (some Western platforms are restricted in Russia and mainland China). Confirm availability and legality before committing budget.</p>`);

S("content", "Content system", `
<p>Twelve evergreen pillars, rendered per city with the city's language, currency and posting window. Hooks avoid return promises (a test fails the build if guarantee language appears).</p>
${table(["Pillar", "Format", "Call to action"], PILLARS.map((p) => [esc(p.title.replace("{city}", "your city").replace("{country}", "your country").replace("{currency}", "your currency")), p.format, esc(p.cta.replace("{city}", "your city").replace("{currency}", "your currency"))]))}
<h3>Rules</h3>
<ul>
<li><b>ROI is a worksheet.</b> Visitors enter price, rent and costs in their own currency; the output is arithmetic. No appreciation forecasts.</li>
<li><b>Facts need a source and a date</b> on the claims register. The property records in the repository are a snapshot, not live availability.</li>
<li><b>Every property ad carries the regulator's advertising permit number and QR code</b> (confirm the current format with RERA/DLD).</li>
<li><b>Native-language review</b> before publishing; right-to-left layout checked for Arabic, Persian and Urdu.</li>
<li><b>UTM convention:</b> <code>utm_source=&lt;channel&gt;&amp;utm_medium=&lt;organic|lead_ad|listing&gt;&amp;utm_campaign=&lt;cityid&gt;-&lt;pillar&gt;-&lt;yyyymm&gt;</code></li>
</ul>
<h3>Weekly rhythm</h3>
${table(["Day", "Work"], [["Monday", "Brief, approvals, claims check"], ["Tue–Thu", "Publish by wave and cluster; reply to signals"], ["Friday", "Live or Q&A; nurture sends (opted-in only)"], ["Saturday", "Review dashboard; plan next week"]])}`);

S("scoring", "Scoring and routing", `
${table(["Signal", "Points"], [["Stated intent (viewing 20, call-back 15, prices 10, brochure 5, form 8; capped)", "up to 40"], ["Timeline (immediate 15, 1–3 months 12, 3–6 months 7, 6+ months 2)", "up to 15"], ["Budget (AED 2M+ 15, 1M+ 12, " + DEFAULT_SCORING.minInventoryAed.toLocaleString("en-US") + "+ 8, any 3)", "up to 15"], ["Purpose and finance stated", "up to 10"], ["Contact quality (phone 5, e-mail 3, name 2)", "up to 10"], ["Channel (enquiry channels 10, social 5–6, listening 1)", "up to 10"], ["City tier (Tier 0/1 5, Tier 2 3)", "up to 5"], ["Disposable e-mail", "−10"], ["Another broker, duplicate, no usable contact", "reject / merge"]])}
<p>Bands: <b>hot ≥ ${DEFAULT_SCORING.hot}</b>, <b>warm ≥ ${DEFAULT_SCORING.warm}</b>, <b>nurture ≥ ${DEFAULT_SCORING.nurture}</b>, below that cold. The weights are starting points; re-fit them against closed deals after the first 90 days. Every reason is written into the OS note so a person can see why a lead was routed.</p>
<h3>Routing</h3>
${table(["Situation", "Destination"], [["Did not enquire, no consent", "Signal queue: public reply by a person; no CRM lead"], ["Cold or nurture", "Opted-in WhatsApp/e-mail nurture, BDM owns"], ["Budget ≥ AED " + DEFAULT_ROUTING.vipBudgetAed.toLocaleString("en-US"), "BDM, 5-minute SLA, Manager informed"], ["Hot, agent on shift, under " + DEFAULT_ROUTING.agentCapacity + " active leads", "Agent, " + DEFAULT_ROUTING.slaMinutes.hot + "-minute SLA"], ["Warm, agent under " + Math.round(DEFAULT_ROUTING.agentSoftLimit * 100) + "% capacity", "Agent, " + DEFAULT_ROUTING.slaMinutes.warm + "-minute SLA"], ["Agent off shift, at capacity or no seat", "BDM triages"]])}
<h3>The one-agent time-zone problem</h3>
<p>People enquire in their local evening (taken as 19:00–22:00). Cities with <b>no overlap</b> between that window and the agent's shift on 26 October 2026:</p>
${bars(coverage.map((c) => [`Shift ${c.label} (Dubai) · Tier 0/1`, c.t01, `of ${c.t01n}`]), 71)}
${bars(coverage.map((c) => [`Shift ${c.label} (Dubai) · all cities`, c.all, `of ${c.alln}`]), 622)}
${callout("Recommendation", `Set the Agent's shift to <b>14:00–23:00 Dubai time</b> and have the BDM cover mornings. Daylight-saving changes move Europe and North America by an hour. The engine reads <code>AGENT_SHIFT</code>, so changing it is a one-line edit.`)}`);

const matrix = table(["Action", ...GROWTH_ROLES], ACTIONS.map((a) => [a.replaceAll("_", " "), ...GROWTH_ROLES.map((r) => (POLICY[r].has(a) ? (r === "Agent" && (a === "view_pii" || a === "edit_lead") ? "own" : "✓") : "·"))]), "matrix");
S("access", "Access: five seats", `
<p>Owner, Manager, BDM, IT Admin and <b>one</b> Agent. The code rejects a second agent, any other role, and one person in two seats.</p>
${matrix}
<h3>SWK OS roles</h3>
${table(["Growth", "SWK OS role", "Permissions"], osRoleDefinitions().map((d) => [d.growth, d.osRole, d.permissions ? esc(Object.entries(d.permissions).map(([m, a]) => `${m}: ${a.join("/")}`).join("; ")) : esc(d.note)]))}
<h3>Verified on a local SWK OS</h3>
${table(["Role", "List leads", "Export", "Delete", "Create API key", "List users"], [["Growth Agent", "200", "403", "403", "403", "403"], ["Growth IT", "<b>403</b>", "403", "403", "403", "200"], ["Growth BDM", "200", "403", "403", "403", "403"], ["Growth Sync (key)", "200", "403", "403", "403", "403"]])}
${callout("Known gaps in SWK OS", `<b>No row-level scoping:</b> the Agent can list all leads. <b>API-key escalation:</b> write access on <i>admin</i> lets a role mint a key that acts as Admin (reproduced). <b>Published default credentials</b> in the OS README and example environment; confirm they were changed on production. Change requests are listed in the next section.`, "warn")}`);

S("os", "SWK OS integration", `
<p>Checked against a running local copy of the SWK OS repository, not only its source. Not yet run against production.</p>
${table(["Growth field", "OS lead field", "Rule"], [["Name", "company, contact_name", "company is required in OS"], ["Phone / e-mail", "phone, email", "E.164 phone"], ["Channel", "source", "WhatsApp, LinkedIn, Website, Portal enquiry, Property Finder, Bayut, Dubizzle, Referral, Exhibition / event, Email campaign, Inbound call; social channels → Other"], ["Consent", "marketing_consent", "“Opted in” only with captured consent, else Unknown"], ["City, country", "origin", "e.g. “Kochi, IN”"], ["Budget", "est_value", "AED"], ["Route", "owner_id", "Agent or BDM user id"], ["Everything else", "notes", "[SWKGrowth] block: gid, channel, city, score and reasons, SLA, consent evidence, UTM"]])}
${callout("A bug found only by testing against the real system", "OS search (<code>q</code>) covers lead number, company and contact name only. The first version looked up duplicates with it, found nothing, and created a second CRM record for a repeat lead. The client now uses OS filters (<code>filters=[{field,op,value}]</code>) on phone, e-mail and the <code>gid</code> in the note; the repeat enquiry is merged and a note added.")}
<h3>Change requests for the OS repository (not applied)</h3>
<ol><li>Add social sources (Instagram, Facebook, TikTok, YouTube, X, Telegram, Snapchat, Google Business) to <code>LEAD_SOURCES</code>.</li><li>Add city, country, channel, UTM, score and consent-evidence fields to <code>leads</code> so they can be filtered and reported.</li><li>Add owner-level row scoping for staff roles.</li><li>Split <i>admin</i> so integrations and key creation are separate from role management.</li><li>Refuse API-key creation for a user with more privilege than the creator.</li></ol>`);

S("compliance", "Compliance", `
${table(["Where the lead is", "Check", "Practical rule"], [
  ["UAE", "PDPL (Decree-Law 45 of 2021); telecom marketing rules; RERA/DLD advertising rules", "Consent or enquiry before contact; evidence stored; permit number and QR on property ads"],
  ["United Kingdom, EU/EEA", "UK GDPR, PECR; GDPR, ePrivacy", "Explicit opt-in; data-subject rights; transfer basis for UAE storage"],
  ["India", "DPDP Act 2023; commercial-communication rules", "Plain-language consent notice; check DND rules before calls"],
  ["Saudi Arabia", "PDPL", "Consent and transfer rules"],
  ["China (mainland)", "PIPL", "Separate consent; operate through an authorised local partner"],
  ["USA / Canada", "TCPA, state laws; CASL, CAN-SPAM", "Written consent for texts and calls"],
  ["Russia", "Sanctions, data-localisation", "Screen for sanctions before any transaction; take advice before storing residents' data"],
])}
<p class="small">Working notes, not legal advice. Counsel must confirm every row before launch and whenever a market is added. Sanctions and AML/DNFBP screening happen in SWK OS before any transaction, whatever the lead source.</p>
<h3>Enforced in code</h3>
<ul><li>Consent gate: nobody who did not enquire or consent becomes a CRM lead.</li><li>Consent is never inferred; OS shows “Unknown” unless evidence exists.</li><li>Intake endpoints verify an HMAC signature, cap body size, rate-limit.</li><li>The ledger stores only hashed dedupe keys and OS ids, with owner-only file permissions.</li><li>Public-post signals keep a 280-character excerpt and are purged after 30 days unless converted.</li></ul>`);

S("kpis", "Measurement", `
<p>Everything below must be measured; no conversion rate is assumed in this report. Review weekly by city, channel and pillar.</p>
${table(["Stage", "Weeks 1–4", "Weeks 5–8", "Weeks 9–12"], ["Posts published", "Enquiries + opt-ins", "Qualified", "Viewings", "Offers", "Deals", "Revenue per city (AED)"].map((s) => [s, "", "", ""]), "worksheet")}
<p><b>Decision rule at every 4-week review:</b> scale a city or pillar that beats the median on qualified leads per hour of effort; hold one near the median; stop one below the floor for two reviews in a row. Fix the numeric thresholds after the first month from the baseline, and write each threshold and date down before the test starts.</p>`);

S("roadmap", "Roadmap", table(["Weeks", "Deliverables"], [
  ["Before launch", "Legal review of consent text and jurisdictions · claims register · permit workflow · OS roles and Growth Sync key created by the Owner · engine dry run on a sample export"],
  ["1–4 · Wave 1", "Tier 0/1 briefs and 12 pillars in the top five languages · WhatsApp click-to-chat everywhere · Tier 1 landing pages · first instant form · listening queries live · SLA view in OS"],
  ["5–8 · Wave 2", "South Asia, GCC, Levant, North Africa, Turkey clusters · regional-language reels · webinar series · portal import · referral programme"],
  ["9–12 · Wave 3", "Europe, CIS, Africa clusters · investor-grade guides · first 90-day re-ranking of tiers"],
  ["13–16 · Wave 4", "Asia-Pacific, Americas, Oceania · automated weekly report · paid amplification only for proven city/pillar pairs"],
]));

S("risks", "Risks", table(["Risk", "Mitigation"], [
  ["Platform account or ad-account suspension", "No scraping; official APIs only; backup admins"],
  ["Consent or data-protection breach", "Consent gate, stored evidence, legal review per jurisdiction, 30-day signal purge"],
  ["Misleading property or return claims", "Claims register; no return promises; permit on every ad"],
  ["One agent overwhelmed or absent", "Capacity cap, BDM fallback, shift aligned to enquiry hours, opted-in nurture"],
  ["Thin or duplicated city content", "Uniqueness rule, human review, cluster approach"],
  ["API key misuse in SWK OS", "Owner-only creation, low-privilege service user, 90-day rotation"],
  ["Sanctions or source-of-funds exposure", "AML/sanctions screening in OS before any transaction"],
]));

S("next", "Decisions and next actions", `
${table(["#", "Action", "Who"], [
  [1, "Confirm the Agent's shift (recommended 14:00–23:00 Dubai time)", "Owner"],
  [2, "Counsel review of consent wording and the jurisdiction table", "Owner / counsel"],
  [3, "Create roles Growth BDM, Growth IT, Growth Agent, Growth Sync and the service user in SWK OS; mint the Growth Sync key", "Owner"],
  [4, "Check production OS for default passwords and review existing roles for <i>admin</i> write access", "Owner + IT"],
  [5, "Approve the OS change requests (social sources, attribution fields, row scoping, admin split)", "Owner"],
  [6, "Build the claims register and the permit workflow", "Manager"],
  [7, "Dry-run the engine on one real export; send ten leads; verify in OS", "BDM + IT"],
  [8, "Register Meta and OS webhooks behind HTTPS", "IT"],
  [9, "Name language reviewers for the top five languages", "BDM"],
  [10, "Keep this repository private", "IT"],
])}`);

// ---- appendix: full city list
const byRegion = {};
for (const c of CITY_LIST) (byRegion[c.region] ??= []).push(c);
const appendix = `<section class="page appendix" id="appendix"><h2><span class="num">A</span>Appendix: all ${stats.total} cities</h2>
<p class="small">★ = Tier 1 · ⌂ = Tier 0 (UAE). Content languages are listed at the end.</p>
${Object.entries(byRegion).map(([r, list]) => `<h3>${esc(r)} <small>(${list.length})</small></h3><p class="cities">${list.map((c) => `${c.tier === 1 ? "★ " : c.tier === 0 ? "⌂ " : ""}${esc(c.name)} <small>${c.country}</small>`).join(" · ")}</p>`).join("")}
<h3>Content languages (${stats.languages})</h3><p class="cities">${[...new Set(CITY_LIST.flatMap((c) => c.languages))].sort().map((l) => `${esc(langName(l))} <small>${l}</small>`).join(" · ")}</p></section>`;

const toc = sections.map((s, i) => `<li><a href="#${s.id}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(s.title)}</a></li>`).join("") + `<li><a href="#appendix"><span>A</span>Appendix: all cities</a></li>`;

const css = `
@font-face{font-family:'Clash Display';src:url('../../public/brand/os/fonts/clash-display-500.woff2') format('woff2');font-weight:500}
@font-face{font-family:'Clash Display';src:url('../../public/brand/os/fonts/clash-display-600.woff2') format('woff2');font-weight:600}
@font-face{font-family:'Clash Display';src:url('../../public/brand/os/fonts/clash-display-700.woff2') format('woff2');font-weight:700}
@font-face{font-family:'General Sans';src:url('../../public/brand/os/fonts/general-sans-400.woff2') format('woff2');font-weight:400}
@font-face{font-family:'General Sans';src:url('../../public/brand/os/fonts/general-sans-500.woff2') format('woff2');font-weight:500}
@font-face{font-family:'General Sans';src:url('../../public/brand/os/fonts/general-sans-600.woff2') format('woff2');font-weight:600 700}
:root{--navy:#14305c;--mid:#0b1a33;--champ:#c9a96e;--champ-deep:#9a7a42;--pearl:#f6f2ea;--line:#e7e1d4;--ink:#0b1a33;--body:#3a4660;--muted:#6b7488;--dune:#c4492f;--oasis:#1f7a7a;--soft:#f0ebe1;--champ-soft:#f3ead8}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:var(--pearl);color:var(--body);font:400 10.5pt/1.5 'General Sans','Instrument Sans',Arial,sans-serif;font-variant-numeric:tabular-nums}
h1,h2,h3{font-family:'Clash Display','Plus Jakarta Sans',Arial,sans-serif;color:var(--ink);letter-spacing:-.02em;line-height:1.15;margin:0}
a{color:var(--navy)}
code{font-family:ui-monospace,Menlo,monospace;font-size:.88em;background:var(--soft);padding:1px 5px;border-radius:5px}
.sheet{max-width:880px;margin:0 auto;background:#fff}
.cover{background:var(--mid);color:#fff;min-height:285mm;position:relative;overflow:hidden;padding:26mm 20mm;display:flex;flex-direction:column;justify-content:space-between;page-break-after:always;break-after:page}
.cover img.logo{width:92px;height:auto}
.cover h1{color:#fff;font-size:44pt;font-weight:600;max-width:560px;margin-top:40mm}
.cover h1 em{font-style:normal;color:var(--champ)}
.cover p{color:#c9d1e3;max-width:520px;font-size:12pt}
.cover .meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:8mm}
.pill{display:inline-block;border:1px solid rgba(201,169,110,.55);color:var(--champ);border-radius:999px;padding:5px 14px;font-size:9pt;font-weight:600;letter-spacing:.04em}
.sky{position:absolute;left:0;right:0;bottom:0;height:90px;opacity:.9}
.sky img{position:absolute;left:0;bottom:0;width:100%;height:100%;object-fit:fill}
.sky .back{opacity:.35}
.toc{padding:20mm;page-break-after:always;break-after:page}
.toc h2{font-size:24pt;margin-bottom:10mm}
.toc ol{list-style:none;margin:0;padding:0;columns:2;column-gap:14mm}
.toc li{break-inside:avoid;border-bottom:1px solid var(--line)}
.toc a{display:flex;gap:12px;padding:9px 0;text-decoration:none;color:var(--ink);font-weight:500}
.toc a span{color:var(--champ-deep);font-weight:700;width:24px}
.page{padding:12mm 18mm 6mm;border-top:1px solid var(--line)}
.page>h2{font-size:22pt;margin-bottom:6mm;display:flex;align-items:baseline;gap:12px}
.num{font-size:11pt;color:var(--champ-deep);font-weight:700;letter-spacing:.06em;border:1px solid var(--champ);border-radius:999px;padding:2px 10px}
h3{font-size:13pt;margin:7mm 0 3mm}
h3 small{color:var(--muted);font-weight:500}
p{margin:0 0 3mm}
.lead{font-size:12.5pt;color:var(--ink);line-height:1.45}
.small{font-size:9pt;color:var(--muted)}
ul,ol{margin:0 0 3mm;padding-left:18px}li{margin-bottom:2mm}
table{width:100%;border-collapse:collapse;margin:3mm 0 5mm;font-size:9.2pt}
th{background:var(--navy);color:#fff;text-align:left;font-weight:600;padding:6px 8px}
td{padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:nth-child(even) td{background:#faf7f0}
tr{break-inside:avoid}
table.matrix td,table.matrix th{text-align:center;white-space:nowrap}table.matrix td:first-child,table.matrix th:first-child{text-align:left;text-transform:capitalize}
table.worksheet td{height:26px}
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:5mm 0}
.stats div{background:var(--navy);color:#fff;border-radius:14px;padding:14px 10px;text-align:center}
.stats b{display:block;font:600 24pt 'Clash Display',sans-serif;color:var(--champ)}
.stats span{font-size:8.5pt;color:#d6dcea}
.callout{border:1px solid var(--champ);background:var(--champ-soft);border-radius:14px;padding:12px 16px;margin:5mm 0;break-inside:avoid}
.callout strong{display:block;color:var(--ink);font-family:'Clash Display',sans-serif;font-size:11.5pt;margin-bottom:2mm}
.callout p{margin:0;line-height:1.55}
.callout.warn{border-color:var(--dune);background:#fbece8}
.bars{margin:3mm 0 5mm}.bar{display:grid;grid-template-columns:230px 1fr 90px;gap:10px;align-items:center;margin:4px 0;font-size:9pt}
.bt{background:var(--soft);border-radius:999px;height:10px;overflow:hidden;display:block}.bt i{display:block;height:100%;background:var(--navy);border-radius:999px}
.bv{font-weight:600;color:var(--ink)}.bv small{color:var(--muted);font-weight:400}
.diagram{width:100%;height:auto;margin:3mm 0}
.cities{font-size:8.3pt;line-height:1.7;color:var(--ink)}.cities small{color:var(--muted);font-size:7pt}
footer.end{padding:12mm 18mm;background:var(--mid);color:#c9d1e3;display:flex;align-items:center;gap:16px;font-size:9pt}footer.end img{width:48px}
@page{size:A4;margin:0 0 12mm}
@media print{body{background:#fff}.sheet{max-width:none}.page{border-top:0}.page.appendix{break-before:page}.cover{min-height:285mm;height:285mm}h2,h3{break-after:avoid}}
@media (max-width:700px){.stats{grid-template-columns:repeat(2,1fr)}.bar{grid-template-columns:1fr}.toc ol{columns:1}.cover h1{font-size:30pt}.page{padding:12mm 5mm}}
`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>SWK Growth and Lead Engine Report</title><style>${css}</style></head><body><div class="sheet">
<header class="cover"><div><img class="logo" src="../../public/brand/os/swk-logo-white.png" alt="SWK Properties"></div>
<div><h1>Growth &amp; <em>Lead Engine</em> Report</h1><p>How SWK Properties generates, qualifies and routes its own organic leads from 622 cities into SWK OS, with five people, one agent and no scraping.</p>
<div class="meta"><span class="pill">INTERNAL · CONFIDENTIAL</span><span class="pill">${today}</span><span class="pill">os.swkpropertiesuae.com</span></div></div>
<div class="sky" aria-hidden="true"><img class="back" src="../../public/brand/os/skyline-back.svg" alt=""><img src="../../public/brand/os/skyline-front.svg" alt=""></div></header>
<nav class="toc"><h2>Contents</h2><ol>${toc}</ol><p class="small" style="margin-top:12mm">Every number in this report is computed from <code>data/cities.json</code> and the engine source at build time. Replace the worksheet with measured results; none are assumed.</p></nav>
${sections.map((s, i) => `<section class="page" id="${s.id}"><h2><span class="num">${String(i + 1).padStart(2, "0")}</span>${esc(s.title)}</h2>${s.html}</section>`).join("\n")}
${appendix}
<footer class="end"><img src="../../public/brand/os/swk-logo-white.png" alt=""><span>SWK Properties L.L.C. · RERA ORN 51517 · Internal use only</span></footer></div></body></html>`;

fs.mkdirSync("reports/growth-lead-engine", { recursive: true });
fs.writeFileSync("reports/growth-lead-engine/index.html", html);
console.log(`reports/growth-lead-engine/index.html (${Math.round(html.length / 1024)} KB, ${sections.length} sections)`);
