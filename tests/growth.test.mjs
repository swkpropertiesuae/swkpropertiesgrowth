import test from "node:test";
import assert from "node:assert/strict";
import { CITY_LIST, cityById, cityStats, filterCities, utcOffsetMinutes, gstDiffMinutes, windowInGst, overlapMinutes, fmtMinutes, slugify } from "../src/growth/cities.mjs";
import { cityBrief, PILLARS } from "../src/growth/content.mjs";
import { normalizePhone, normalizeEmail, canonicalLead, osSource, dedupeKeys } from "../src/growth/normalize.mjs";
import { scoreLead } from "../src/growth/scoring.mjs";
import { assignLead, onShift } from "../src/growth/assign.mjs";
import { GROWTH_ROLES, can, assertSeats, maskLead, osRoleDefinitions, POLICY, ACTIONS } from "../src/growth/access.mjs";
import { classifySignal, toSignal, purgeSignals } from "../src/growth/signals.mjs";
import { parseCsv, csvCell } from "../src/growth/csv.mjs";
import { processLead } from "../src/growth/pipeline.mjs";

const lead = (o = {}) => canonicalLead({ name: "Test Buyer", phone: "+971501234567", channel: "web_form", city: "Dubai", ...o });
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MON_NOON_GST = new Date("2026-10-26T08:00:00Z"); // Monday 12:00 in Dubai
const TUE_MIDNIGHT_GST = new Date("2026-10-26T20:00:00Z");

// ---------------------------------------------------------------- cities
test("city programme covers 500+ cities across tiers 0, 1 and 2 with unique ids", () => {
  const s = cityStats();
  assert.ok(s.total >= 500, `only ${s.total} cities`);
  assert.equal(new Set(CITY_LIST.map((c) => c.id)).size, CITY_LIST.length);
  assert.ok(s.countries >= 100);
  assert.ok(s.byTier[0] === 8 && s.byTier[1] >= 50 && s.byTier[2] >= 400);
  assert.equal(Object.keys(s.byWave).length, 5);
});
test("every city has a valid IANA time zone, language, currency and channel stack", () => {
  for (const c of CITY_LIST) {
    assert.doesNotThrow(() => new Intl.DateTimeFormat("en", { timeZone: c.tz }), `${c.id} tz ${c.tz}`);
    assert.ok(c.languages.length >= 1 && /^[a-z]{2,3}$/.test(c.languages[0]), c.id);
    assert.match(c.currency, /^[A-Z]{3}$/);
    assert.ok(c.channels.length >= 4, c.id);
    assert.ok([0, 1, 2].includes(c.tier) && c.wave >= 0 && c.wave <= 4);
  }
});
test("regional languages and RTL are set per city", () => {
  assert.deepEqual(cityById("in-kochi").languages.slice(0, 2), ["ml", "en"]);
  assert.equal(cityById("eg-cairo").rtl, true);
  assert.equal(cityById("pk-lahore").rtl, true);
  assert.equal(cityById("gb-london").rtl, false);
  assert.notEqual(cityById("in-hyderabad").id, cityById("pk-hyderabad").id);
});
test("search and filters", () => {
  assert.ok(filterCities({ q: "kerala" }).length === 0);
  assert.ok(filterCities({ q: "kochi" }).length === 1);
  assert.ok(filterCities({ tier: 1 }).every((c) => c.tier === 1));
  assert.ok(filterCities({ region: "GCC" }).every((c) => c.region === "GCC"));
  assert.equal(slugify("São Paulo"), "sao-paulo");
});
test("time-zone arithmetic converts local posting windows to Dubai time", () => {
  assert.equal(utcOffsetMinutes("Asia/Dubai"), 240);
  assert.equal(gstDiffMinutes("Asia/Kolkata"), -90);
  const w = windowInGst("Asia/Kolkata", 19, 22);
  assert.equal(fmtMinutes(w.start), "17:30");
  assert.equal(fmtMinutes(w.end), "20:30");
  // London evening (19-22) falls at 22:00-01:00 GST during BST and 23:00-02:00 in winter: window wraps midnight
  const lon = windowInGst("Europe/London", 19, 22, new Date("2026-07-01T12:00:00Z"));
  assert.ok(lon.start > lon.end);
  assert.equal(overlapMinutes({ start: 540, end: 1140 }, { start: 1050, end: 1230 }), 90);
  assert.equal(overlapMinutes({ start: 1380, end: 120 }, { start: 0, end: 60 }), 60);
});

// ---------------------------------------------------------------- content
test("city brief is localised, complete and free of guarantee language", () => {
  const b = cityBrief(cityById("in-kochi"), new Date("2026-10-26T00:00:00Z"));
  assert.equal(b.pillars.length, PILLARS.length);
  assert.equal(b.languages[0].name, "Malayalam");
  assert.equal(b.postingWindows[1].gst, "17:30–20:30 GST");
  assert.ok(b.hashtags.includes("#KochiToDubai"));
  assert.ok(b.pillars.every((p) => !p.title.includes("{") && !p.hook.includes("{") && !p.cta.includes("{")));
  const banned = /guarantee|risk[- ]free|assured return|can't lose|sure profit|double your/i;
  const text = JSON.stringify([PILLARS, b.pillars, b.leadMagnets, b.cadence]);
  assert.ok(!banned.test(text));
  assert.match(cityBrief(cityById("ae-dubai")).cadence, /Always-on/);
});

// ---------------------------------------------------------------- normalisation
test("phone normalisation produces E.164 and rejects junk", () => {
  assert.equal(normalizePhone("050 123 4567", "AE"), "+971501234567");
  assert.equal(normalizePhone("00919847012345"), "+919847012345");
  assert.equal(normalizePhone("+91 98470 12345"), "+919847012345");
  assert.equal(normalizePhone("09847012345", "IN"), "+919847012345");
  assert.equal(normalizePhone("9112345678", "IN"), "+919112345678", "10-digit national number starting 91 is not a country code");
  assert.equal(normalizePhone("919847012345", "IN"), "+919847012345");
  for (const bad of ["", "abc", "123", null, undefined, "+1234567890123456"]) assert.equal(normalizePhone(bad), null);
});
test("email and source mapping", () => {
  assert.equal(normalizeEmail(" A@B.Com "), "a@b.com");
  assert.equal(normalizeEmail("nope"), null);
  assert.equal(osSource("whatsapp"), "WhatsApp");
  assert.equal(osSource("instagram"), "Other");
  assert.deepEqual(dedupeKeys(lead({ email: "x@y.com" })), ["p:971501234567", "e:x@y.com"]);
});
test("consent is never inferred as marketing opt-in", () => {
  assert.equal(canonicalLead({ phone: "+971501234567", channel: "web_form" }).consent.marketing, false);
  assert.equal(canonicalLead({ phone: "+971501234567", channel: "web_form" }).consent.basis, "enquiry");
  assert.equal(canonicalLead({ phone: "+971501234567", channel: "listening" }).consent.basis, "none");
  assert.equal(canonicalLead({ phone: "+971501234567", channel: "instagram", consent: { marketing: true } }).consent.basis, "consent");
});

// ---------------------------------------------------------------- scoring
test("scoring is bounded, explainable and rejects brokers, duplicates and unreachable contacts", () => {
  const hot = scoreLead(lead({ intent: { askedViewing: true, askedCallback: true }, timeline: "immediate", budgetAed: 2_500_000, purpose: "investment", finance: "cash", email: "a@b.com" }), { tier: 1 });
  assert.equal(hot.band, "hot");
  assert.ok(hot.score <= 100 && hot.reasons.length >= 5);
  assert.equal(scoreLead(lead({ isBroker: true })).band, "reject");
  assert.equal(scoreLead(lead(), { duplicate: true }).band, "duplicate");
  assert.equal(scoreLead(lead({ phone: null, email: null })).band, "reject");
  const cold = scoreLead(lead({ channel: "instagram" }), { tier: 2 });
  assert.ok(["cold", "nurture"].includes(cold.band));
  assert.ok(scoreLead(lead({ email: "x@mailinator.com" })).score < scoreLead(lead({ email: "x@gmail.com" })).score);
});

// ---------------------------------------------------------------- routing
test("routing: single agent, shift, capacity, VIP, signals", () => {
  const hotLead = lead({ intent: { askedViewing: true, askedCallback: true, formSubmitted: true }, timeline: "immediate", budgetAed: 1_500_000, purpose: "investment", finance: "cash", email: "a@b.com" });
  const hot = scoreLead(hotLead, { tier: 1 });
  const agent = (o = {}) => ({ agent: { activeLeads: 3, shift: { days: ALL_DAYS, start: "09:00", end: "19:00" }, ...o } });
  assert.equal(assignLead(hotLead, hot, agent(), undefined, MON_NOON_GST).queue, "agent");
  assert.equal(assignLead(hotLead, hot, agent(), undefined, MON_NOON_GST).slaMinutes, 5);
  assert.equal(assignLead(hotLead, hot, agent(), undefined, TUE_MIDNIGHT_GST).queue, "bdm", "off shift");
  assert.equal(assignLead(hotLead, hot, agent({ activeLeads: 15 }), undefined, MON_NOON_GST).queue, "bdm", "at capacity");
  assert.equal(assignLead(hotLead, hot, {}, undefined, MON_NOON_GST).queue, "bdm", "no agent seat");
  const vip = lead({ ...hotLead, budgetAed: 8_000_000 });
  assert.match(assignLead(vip, scoreLead(vip, { tier: 1 }), agent(), undefined, MON_NOON_GST).reason, /BDM leads/);
  const found = lead({ channel: "listening", phone: null, email: null });
  assert.equal(assignLead(found, scoreLead(found), agent(), undefined, MON_NOON_GST).queue, "signal");
  const broker = lead({ isBroker: true });
  assert.equal(assignLead(broker, scoreLead(broker), agent()).queue, "none");
});
test("shift calendar uses Dubai time", () => {
  const shift = { days: ["Mon"], start: "09:00", end: "19:00" };
  assert.equal(onShift(shift, MON_NOON_GST), true);
  assert.equal(onShift(shift, new Date("2026-10-26T04:00:00Z")), false); // 08:00 GST
  assert.equal(onShift(shift, new Date("2026-10-27T08:00:00Z")), false); // Tuesday
});

// ---------------------------------------------------------------- access
test("five roles only, with least privilege", () => {
  assert.deepEqual(GROWTH_ROLES, ["Owner", "Manager", "BDM", "IT Admin", "Agent"]);
  for (const a of ACTIONS) assert.ok(can("Owner", a, { userId: "o", lead: { ownerId: "o" } }) || a === "view_own_leads");
  for (const a of ["view_pii", "view_all_leads", "export_leads", "manage_api_keys", "manage_access", "assign_lead"]) assert.equal(can("IT Admin", a), false, a);
  assert.equal(can("IT Admin", "view_system_health"), true);
  for (const a of ["export_leads", "assign_lead", "view_all_leads", "manage_api_keys", "approve_tier1"]) assert.equal(can("Agent", a), false, a);
  assert.equal(can("BDM", "export_leads"), false);
  assert.equal(can("BDM", "assign_lead"), true);
  assert.equal(can("Manager", "manage_api_keys"), false);
  assert.equal(can("Nobody", "view_dashboard"), false);
});
test("agent can touch only leads assigned to them", () => {
  assert.equal(can("Agent", "edit_lead", { userId: "a1", lead: { ownerId: "a1" } }), true);
  assert.equal(can("Agent", "edit_lead", { userId: "a1", lead: { ownerId: "b2" } }), false);
  assert.equal(can("Agent", "view_pii", { userId: "a1" }), false);
});
test("seat limits: exactly one of each role, no extra roles, no shared people", () => {
  const ok = [{ email: "o@x", role: "Owner" }, { email: "m@x", role: "Manager" }, { email: "b@x", role: "BDM" }, { email: "i@x", role: "IT Admin" }, { email: "a@x", role: "Agent" }];
  assert.doesNotThrow(() => assertSeats(ok));
  assert.throws(() => assertSeats([...ok, { email: "a2@x", role: "Agent" }]), /Seat limit exceeded for Agent/);
  assert.doesNotThrow(() => assertSeats([...ok, { email: "a2@x", role: "Agent", active: false }]));
  assert.throws(() => assertSeats([...ok, { email: "s@x", role: "Sales" }]), /not allowed/);
  assert.throws(() => assertSeats([{ email: "p@x", role: "BDM" }, { email: "P@x", role: "Agent" }]), /two Growth seats/);
});
test("masking hides contact detail; OS role definitions never grant export/delete below Manager", () => {
  const m = maskLead({ name: "Aisha Khan", phone: "+971501234567", email: "aisha@example.com" });
  assert.ok(!m.phone.includes("501234") && m.email === "a•••@example.com" && m.name === "Aisha •••");
  for (const d of osRoleDefinitions().filter((x) => x.create)) {
    for (const [mod, acts] of Object.entries(d.permissions)) {
      assert.ok(!acts.includes("export") && !acts.includes("delete"), `${d.osRole}.${mod}`);
      if (mod === "admin") assert.deepEqual(acts, ["view"], "admin write allows API-key minting as any user");
    }
  }
  assert.ok(POLICY["IT Admin"] instanceof Set);
});

// ---------------------------------------------------------------- listening signals
test("intent signals: detected, multilingual, and promos are excluded", () => {
  assert.equal(classifySignal("Thinking of buying an off-plan apartment in Dubai, any advice on payment plans?").intent, "buy");
  assert.equal(classifySignal("Хочу купить квартиру в Дубае, есть рассрочка?").intent, "buy");
  assert.equal(classifySignal("أبحث عن شراء شقة في دبي بخطة دفع").intent, "buy");
  assert.equal(classifySignal("Weather in Dubai is great today").intent, "none");
  assert.equal(classifySignal("Broker here, ready units available now, off-plan Dubai, whatsapp me").intent, "competitor_or_promo");
  assert.equal(toSignal({ platform: "x", url: "u", handle: "h", text: "Weather is nice" }), null);
  const s = toSignal({ platform: "reddit", url: "https://r/1", handle: "u/x", text: "I want to invest in an off-plan property in Dubai. ".repeat(20) });
  assert.ok(s.excerpt.length <= 280 && s.action.includes("No DM"));
});
test("unconverted signals are purged after 30 days", () => {
  const now = new Date("2026-11-30T00:00:00Z");
  const kept = purgeSignals([{ detectedAt: "2026-11-20T00:00:00Z" }, { detectedAt: "2026-09-01T00:00:00Z" }, { detectedAt: "2026-09-01T00:00:00Z", converted: true }], now);
  assert.equal(kept.length, 2);
});

// ---------------------------------------------------------------- csv + pipeline
test("CSV parser handles quotes, embedded newlines, BOM and CRLF; export neutralises formulas", () => {
  const rows = parseCsv('﻿name,notes\r\n"Doe, Jane","line1\nline2"\r\nBob,"say ""hi"""\r\n');
  assert.deepEqual(rows, [{ name: "Doe, Jane", notes: "line1\nline2" }, { name: "Bob", notes: 'say "hi"' }]);
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
});
test("pipeline dedupes across channels and tracks the city tier", () => {
  const seen = new Set();
  const a = processLead({ name: "A", phone: "+919847012345", channel: "instagram", city: "Kochi", countryCode: "IN", consent: { marketing: true } }, { seen });
  const b = processLead({ name: "A", phone: "+91 98470 12345", channel: "facebook", city: "Kochi", countryCode: "IN", consent: { marketing: true } }, { seen });
  assert.equal(a.city, "in-kochi");
  assert.equal(a.duplicate, false);
  assert.equal(b.duplicate, true);
  assert.equal(b.assignment.queue, "none");
});
