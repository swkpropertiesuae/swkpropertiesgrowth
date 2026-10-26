// SWK OS CRM client. Dry-run unless `send: true`. Auth: Bearer API key created in OS (Administration -> API keys, "elv_..." prefix).
import { osSource } from "../src/growth/normalize.mjs";

export const GROWTH_TAG = "[SWKGrowth]";

/** Structured block appended to OS lead notes so attribution survives until OS gets native fields. */
export function noteBlock(p) {
  const { lead, scored, assignment, city, gid } = p;
  const lines = [
    GROWTH_TAG,
    `gid: ${gid}`,
    `channel: ${lead.channel}`,
    `city: ${lead.city || "n/a"}${city ? ` (${city})` : ""}`,
    `score: ${scored.score} (${scored.band})`,
    `route: ${assignment.queue} · SLA ${assignment.slaMinutes ?? "n/a"} min`,
    `consent: ${lead.consent.marketing ? "opted in" : "not given"} · basis ${lead.consent.basis} · ${lead.consent.capturedAt}`,
  ];
  if (lead.campaign) lines.push(`campaign: ${lead.campaign}`);
  if (lead.sourceUrl) lines.push(`source_url: ${lead.sourceUrl}`);
  const utm = Object.entries(lead.utm ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("&");
  if (utm) lines.push(`utm: ${utm}`);
  lines.push(`why: ${scored.reasons.join("; ")}`);
  if (lead.notes) lines.push("", lead.notes);
  return lines.join("\n");
}

export function toOsLead(p, { ownerIds = {}, campaignIds = {}, defaultInterest = "Off-Plan Sale" } = {}) {
  const { lead, assignment } = p;
  const body = {
    company: lead.name || `${lead.channel} lead ${lead.phone ?? lead.email ?? ""}`.trim(),
    contact_name: lead.name || null,
    email: lead.email, phone: lead.phone,
    status: "New",
    source: osSource(lead.channel),
    // Never infer consent: OS gets "Opted in" only when we hold captured consent.
    marketing_consent: lead.consent.marketing ? "Opted in" : "Unknown",
    interest: lead.interest || defaultInterest,
    origin: [lead.city, lead.countryCode].filter(Boolean).join(", ") || null,
    destination: lead.destination || null,
    est_value: lead.budgetAed || null,
    notes: noteBlock(p),
  };
  const owner = ownerIds[assignment.owner];
  if (owner) body.owner_id = owner;
  if (lead.campaign && campaignIds[lead.campaign]) body.campaign_id = campaignIds[lead.campaign];
  return Object.fromEntries(Object.entries(body).filter(([, v]) => v !== null && v !== undefined && v !== ""));
}

export class OsClient {
  constructor({ baseUrl, apiKey, send = false, fetchImpl = globalThis.fetch, retries = 3, timeoutMs = 10000 }) {
    this.baseUrl = baseUrl?.replace(/\/+$/, "");
    this.apiKey = apiKey; this.send = send; this.fetch = fetchImpl; this.retries = retries; this.timeoutMs = timeoutMs;
  }
  async #req(method, path, body) {
    if (!this.baseUrl || !this.apiKey) throw new Error("OS_BASE_URL and OS_API_KEY are required");
    let last;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), this.timeoutMs);
      try {
        const res = await this.fetch(this.baseUrl + path, {
          method, signal: ctl.signal,
          headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json", accept: "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });
        clearTimeout(t);
        const text = await res.text();
        const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : null;
        if (res.ok) return json;
        if (res.status === 429 || res.status >= 500) { last = new Error(`OS ${res.status}`); await new Promise((r) => setTimeout(r, 2 ** attempt * 400)); continue; }
        const err = new Error(`OS ${res.status}: ${json?.error ?? json?.message ?? text.slice(0, 200)}`); err.status = res.status; throw err;
      } catch (e) {
        clearTimeout(t);
        if (e.status) throw e;
        last = e; await new Promise((r) => setTimeout(r, 2 ** attempt * 400));
      }
    }
    throw last ?? new Error("OS request failed");
  }
  async #list(filters, pageSize = 5) {
    const res = await this.#req("GET", `/api/e/leads?pageSize=${pageSize}&filters=${encodeURIComponent(JSON.stringify(filters))}`);
    return (res?.rows ?? []).filter((r) => !r.deleted_at);
  }
  /** Looks for an existing lead by gid (in notes), exact phone or exact e-mail so a re-run never creates a second record. */
  async findExisting({ gid, phone, email }) {
    const probes = [
      gid && [{ field: "notes", op: "contains", value: `gid: ${gid}` }],
      phone && [{ field: "phone", op: "eq", value: phone }],
      email && [{ field: "email", op: "eq", value: email }],
    ].filter(Boolean);
    for (const f of probes) {
      const hit = (await this.#list(f))[0];
      if (hit) return hit;
    }
    return null;
  }
  async createLead(payload) {
    if (!this.send) return { dryRun: true, payload };
    return this.#req("POST", "/api/e/leads", payload);
  }
  async addNote(id, text) {
    if (!this.send) return { dryRun: true, id, text };
    const cur = await this.#req("GET", `/api/e/leads/${id}`);
    return this.#req("PUT", `/api/e/leads/${id}`, { notes: `${cur?.notes ?? ""}\n\n${text}`.trim() });
  }
  async lookupUser(q) {
    const rows = await this.#req("GET", `/api/e/users/lookup?q=${encodeURIComponent(q)}&limit=5`);
    return Array.isArray(rows) ? rows : [];
  }
  async lookupCampaign(name) {
    const rows = await this.#req("GET", `/api/e/campaigns/lookup?q=${encodeURIComponent(name)}&limit=5`);
    return (Array.isArray(rows) ? rows : []).find((r) => r.label?.toLowerCase().includes(name.toLowerCase())) ?? null;
  }
  async activeLeadsFor(ownerId) {
    const rows = await this.#list([{ field: "owner_id", op: "eq", value: ownerId }], 200);
    return rows.filter((r) => ["New", "Contacted", "Qualified"].includes(r.status)).length;
  }
}
