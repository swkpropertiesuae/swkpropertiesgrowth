import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { OsClient, toOsLead, noteBlock } from "../engine/os-crm.mjs";
import { Store } from "../engine/store.mjs";
import { syncLead } from "../engine/sync.mjs";
import { fromCsvRow, fromMetaLead } from "../engine/mappers.mjs";
import { createIntakeServer, hmacHex } from "../engine/intake-server.mjs";
import { processLead } from "../src/growth/pipeline.mjs";
import { loadConfig } from "../engine/config.mjs";

const team = { agent: { activeLeads: 0, shift: { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], start: "00:00", end: "23:59" } } };
const tmp = () => new Store(fs.mkdtempSync(path.join(os.tmpdir(), "growth-")));
const raw = (o = {}) => ({ name: "Priya Nair", phone: "+91 98470 12345", email: "p@example.com", channel: "instagram", city: "Kochi", countryCode: "IN", intent: { askedViewing: true, formSubmitted: true }, budgetAed: 1_200_000, timeline: "1-3m", purpose: "investment", consent: { marketing: true, text: "agree" }, utm: { utm_campaign: "kochi" }, ...o });

/** Mock of the SWK OS endpoints used by the client; request shapes verified against a live local SWK OS. */
function mockOs() {
  const rows = []; const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url); calls.push({ method: init.method, path: u.pathname + u.search, auth: init.headers?.authorization });
    const json = (s, b) => ({ ok: s < 400, status: s, text: async () => JSON.stringify(b) });
    if (u.pathname === "/api/e/leads" && init.method === "POST") { const r = { id: rows.length + 1, ...JSON.parse(init.body) }; rows.push(r); return json(201, r); }
    if (u.pathname === "/api/e/leads" && (!init.method || init.method === "GET")) {
      const f = JSON.parse(u.searchParams.get("filters") ?? "[]");
      return json(200, { rows: rows.filter((r) => f.every((x) => (x.op === "contains" ? String(r[x.field] ?? "").includes(x.value) : r[x.field] === x.value))), total: 0 });
    }
    const m = /^\/api\/e\/leads\/(\d+)$/.exec(u.pathname);
    if (m && init.method === "PUT") { Object.assign(rows[m[1] - 1], JSON.parse(init.body)); return json(200, rows[m[1] - 1]); }
    if (m) return json(200, rows[m[1] - 1]);
    return json(404, { error: "nope" });
  };
  return { rows, calls, fetchImpl };
}
const client = (m, send = true) => new OsClient({ baseUrl: "http://os.test", apiKey: "elv_testkey", send, fetchImpl: m.fetchImpl, retries: 0 });

test("OS payload maps fields, never fabricates consent and carries attribution", () => {
  const p = processLead(raw({ consent: { marketing: false } }), { team });
  p.gid = "g_abc";
  const body = toOsLead(p, { ownerIds: { agent: 7, bdm: 3 } });
  assert.equal(body.marketing_consent, "Unknown");
  assert.equal(body.source, "Other");
  assert.equal(body.origin, "Kochi, IN");
  assert.equal(body.est_value, 1_200_000);
  assert.ok(body.notes.includes("[SWKGrowth]") && body.notes.includes("gid: g_abc") && body.notes.includes("utm_campaign=kochi"));
  assert.equal(toOsLead({ ...p, assignment: { ...p.assignment, owner: "bdm" } }, { ownerIds: { bdm: 3 } }).owner_id, 3);
  assert.equal(toOsLead(processLead(raw({ channel: "whatsapp" }), { team }), {}).source, "WhatsApp");
  assert.ok(noteBlock({ ...p, gid: "g" }).includes("route:"));
});

test("dry run never calls OS for writes; send mode authenticates with a Bearer key", async () => {
  const m = mockOs();
  const dry = await syncLead(raw(), { store: tmp(), os: client(m, false), team });
  assert.equal(dry.status, "dry-run");
  assert.ok(m.calls.every((c) => c.method === undefined || c.method === "GET"));
  const live = await syncLead(raw(), { store: tmp(), os: client(m), team });
  assert.equal(live.status, "created");
  assert.ok(m.calls.every((c) => c.auth === "Bearer elv_testkey"));
  assert.equal(m.rows.length, 1);
});

test("repeat enquiries merge into the existing OS lead instead of duplicating", async () => {
  const m = mockOs(); const store = tmp(); const c = client(m);
  await syncLead(raw(), { store, os: c, team });
  const again = await syncLead(raw({ channel: "facebook", campaign: "retarget" }), { store, os: c, team });
  assert.equal(again.status, "merged");
  assert.equal(m.rows.length, 1);
  assert.match(m.rows[0].notes, /repeat enquiry via facebook \/ retarget/);
  // fresh store (e.g. restart): found in OS by gid/phone probe
  const third = await syncLead(raw(), { store: tmp(), os: c, team });
  assert.equal(third.status, "merged");
  assert.equal(m.rows.length, 1);
});

test("signals, brokers and unreachable contacts never reach the CRM", async () => {
  const m = mockOs();
  const r1 = await syncLead(raw({ channel: "listening", phone: "", email: "", intent: {}, consent: {} }), { store: tmp(), os: client(m), team });
  const r2 = await syncLead(raw({ isBroker: true }), { store: tmp(), os: client(m), team });
  const r3 = await syncLead(raw({ phone: "x", email: "y" }), { store: tmp(), os: client(m), team });
  assert.deepEqual([r1.status, r2.status, r3.status], ["signal-only", "rejected", "rejected"]);
  assert.equal(m.rows.length, 0);
  const found = await syncLead(raw({ channel: "listening", consent: { basis: "none" }, intent: {} }), { store: tmp(), os: client(m), team });
  assert.equal(found.status, "signal-only");
  assert.equal(m.rows.length, 0);
});

test("client retries 5xx and 429, fails fast on 4xx", async () => {
  let n = 0;
  const flaky = new OsClient({ baseUrl: "http://os.test", apiKey: "k", send: true, retries: 2, fetchImpl: async () => (++n < 3 ? { ok: false, status: 503, text: async () => "" } : { ok: true, status: 201, text: async () => '{"id":9}' }) });
  assert.equal((await flaky.createLead({ company: "x" })).id, 9);
  assert.equal(n, 3);
  let m = 0;
  const bad = new OsClient({ baseUrl: "http://os.test", apiKey: "k", send: true, retries: 3, fetchImpl: async () => (m++, { ok: false, status: 403, text: async () => '{"error":"forbidden"}' }) });
  await assert.rejects(() => bad.createLead({ company: "x" }), /OS 403: forbidden/);
  assert.equal(m, 1);
  await assert.rejects(() => new OsClient({ send: true }).createLead({}), /OS_BASE_URL and OS_API_KEY/);
});

test("CSV and Meta mappers accept only explicit consent", () => {
  const row = { full_name: "A B", phone_number: "0501234567", consent: "yes", budget: "AED 1,500,000", country: "ae" };
  const a = fromCsvRow(row, { channel: "facebook" });
  assert.equal(a.consent.marketing, true); assert.equal(a.budgetAed, 1500000); assert.equal(a.countryCode, "AE");
  assert.equal(fromCsvRow({ ...row, consent: "" }, { basis: "enquiry" }).consent.marketing, false);
  assert.equal(fromCsvRow({ ...row, consent: "no" }, {}).consent.marketing, false);
  const meta = fromMetaLead({ id: "1", platform: "ig", created_time: "2026-10-26T10:00:00Z", field_data: [{ name: "full_name", values: ["Sam"] }, { name: "phone_number", values: ["+971501234567"] }, { name: "consent", values: ["yes"] }] });
  assert.equal(meta.channel, "instagram"); assert.equal(meta.consent.marketing, true); assert.equal(meta.name, "Sam");
  assert.equal(fromMetaLead({ id: "2", field_data: [{ name: "phone_number", values: ["+971501234567"] }] }).consent.marketing, false);
});

test("config requires JSON shift and defaults to dry run", () => {
  assert.equal(loadConfig({}).os.send, false);
  assert.throws(() => loadConfig({ AGENT_SHIFT: "nope" }), /AGENT_SHIFT/);
  assert.equal(loadConfig({ OS_SEND: "true", GROWTH_AGENT_USER_ID: "5" }).owners.agent, 5);
});

test("intake server: signatures, Meta handshake, size limit and OS status webhook", async () => {
  const m = mockOs(); const store = tmp();
  const config = { owners: {}, intake: { secret: "s3cret", osWebhookSecret: "oshook" }, meta: { appSecret: "app", verifyToken: "vt", pageToken: "pt", graphVersion: "v21.0" } };
  const graph = async (url) => ({ ok: true, json: async () => ({ id: "L1", platform: "fb", field_data: [{ name: "full_name", values: ["Meta Lead"] }, { name: "phone_number", values: ["+971509998888"] }, { name: "consent", values: ["yes"] }] }) });
  const server = createIntakeServer({ config, store, os: client(m), team, fetchImpl: graph });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (p, body, headers) => fetch(base + p, { method: "POST", headers: { "content-type": "application/json", ...headers }, body });
  try {
    const body = JSON.stringify(raw({ channel: "web_form" }));
    assert.equal((await post("/intake/form", body, { "x-growth-signature": "bad" })).status, 401);
    const ok = await post("/intake/form", body, { "x-growth-signature": hmacHex("s3cret", body) });
    assert.equal(ok.status, 200); assert.equal((await ok.json()).status, "created");
    assert.equal((await post("/intake/form", "{", { "x-growth-signature": hmacHex("s3cret", "{") })).status, 400);
    const big = "x".repeat(70_000);
    assert.ok([413, 500].includes((await post("/intake/form", big, { "x-growth-signature": hmacHex("s3cret", big) }).catch(() => ({ status: 413 }))).status));

    assert.equal(await (await fetch(`${base}/intake/meta?hub.mode=subscribe&hub.verify_token=vt&hub.challenge=42`)).text(), "42");
    assert.equal((await fetch(`${base}/intake/meta?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=42`)).status, 403);
    const evt = JSON.stringify({ entry: [{ changes: [{ field: "leadgen", value: { leadgen_id: "L1" } }] }] });
    assert.equal((await post("/intake/meta", evt, { "x-hub-signature-256": "sha256=00" })).status, 401);
    const meta = await post("/intake/meta", evt, { "x-hub-signature-256": "sha256=" + hmacHex("app", evt) });
    assert.equal((await meta.json()).results[0].status, "created");

    const gid = [...store.leads.keys()][0];
    const hook = JSON.stringify({ event: "leads.updated", data: { record: { notes: `x\ngid: ${gid}`, status: "Qualified" } } });
    assert.equal((await post("/intake/os-webhook", hook, { "x-swk-signature": "sha256=bad" })).status, 401);
    assert.equal((await (await post("/intake/os-webhook", hook, { "x-swk-signature": "sha256=" + hmacHex("oshook", hook) })).json()).matched, true);
    assert.equal(store.leads.get(gid).status, "Qualified");
    assert.equal((await fetch(base + "/healthz")).status, 200);
    assert.equal((await fetch(base + "/nope")).status, 404);
  } finally { server.close(); }
});

test("ledger survives restart (dedupe memory is durable)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "growth-"));
  const a = new Store(dir); a.append({ t: "lead", gid: "g1", keys: ["p:1"], osId: 4 });
  const b = new Store(dir);
  assert.ok(b.seen.has("p:1")); assert.equal(b.leads.get("g1").osId, 4);
  a.append({ t: "lead", gid: "g2", keys: ["p:971501234567", "e:person@example.com"], osId: 5 });
  const fileText = fs.readFileSync(path.join(dir, "ledger.jsonl"), "utf8");
  assert.ok(!fileText.includes("971501234567") && !fileText.includes("person@example.com"), "no raw contact details on disk");
  assert.equal(new Store(dir).byKey.get("e:person@example.com"), "g2");
  assert.equal((fs.statSync(path.join(dir, "ledger.jsonl")).mode & 0o077), 0, "ledger is owner-only");
});
