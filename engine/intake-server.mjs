// Zero-dependency intake server. Verifies a signature on every request, caps body size, rate-limits per IP.
import http from "node:http";
import crypto from "node:crypto";
import { fromMetaLead } from "./mappers.mjs";
import { syncLead } from "./sync.mjs";

export const hmacHex = (secret, body) => crypto.createHmac("sha256", secret).update(body).digest("hex");
export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on("data", (c) => { n += c.length; if (n > limit) { reject(Object.assign(new Error("Payload too large"), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function createIntakeServer({ config, store, os, team, fetchImpl = globalThis.fetch, now = () => Date.now() }) {
  const hits = new Map();
  const limited = (ip) => {
    const t = now(), w = (hits.get(ip) ?? []).filter((x) => t - x < 60_000);
    w.push(t); hits.set(ip, w);
    return w.length > 120;
  };
  const send = (res, status, body) => { res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(body)); };
  const ctx = () => ({ store, os, team: typeof team === "function" ? team() : team, ownerIds: config.owners });

  const handler = async (req, res) => {
    try {
      const url = new URL(req.url, "http://x");
      if (req.method === "GET" && url.pathname === "/healthz") return send(res, 200, { ok: true });
      if (limited(req.socket.remoteAddress ?? "?")) return send(res, 429, { error: "Too many requests" });

      // Meta webhook verification handshake
      if (req.method === "GET" && url.pathname === "/intake/meta") {
        const ok = config.meta.verifyToken && url.searchParams.get("hub.mode") === "subscribe" && safeEqual(url.searchParams.get("hub.verify_token") ?? "", config.meta.verifyToken);
        res.writeHead(ok ? 200 : 403); return res.end(ok ? url.searchParams.get("hub.challenge") : "Forbidden");
      }
      if (req.method !== "POST") return send(res, 404, { error: "Not found" });
      const raw = await readBody(req);

      if (url.pathname === "/intake/form") {
        if (!config.intake.secret || !safeEqual(req.headers["x-growth-signature"] ?? "", hmacHex(config.intake.secret, raw))) return send(res, 401, { error: "Bad signature" });
        const out = await syncLead({ ...JSON.parse(raw.toString("utf8")), channel: JSON.parse(raw.toString("utf8")).channel ?? "web_form" }, ctx());
        return send(res, 200, { status: out.status, score: out.scored.score, band: out.scored.band, queue: out.assignment.queue });
      }

      if (url.pathname === "/intake/meta") {
        const sig = String(req.headers["x-hub-signature-256"] ?? "").replace(/^sha256=/, "");
        if (!config.meta.appSecret || !safeEqual(sig, hmacHex(config.meta.appSecret, raw))) return send(res, 401, { error: "Bad signature" });
        const body = JSON.parse(raw.toString("utf8"));
        const results = [];
        for (const entry of body.entry ?? []) for (const ch of entry.changes ?? []) {
          if (ch.field !== "leadgen" || !ch.value?.leadgen_id) continue;
          const r = await fetchImpl(`https://graph.facebook.com/${config.meta.graphVersion}/${ch.value.leadgen_id}?access_token=${encodeURIComponent(config.meta.pageToken)}`);
          if (!r.ok) { results.push({ id: ch.value.leadgen_id, status: "fetch-failed" }); continue; }
          const out = await syncLead(fromMetaLead(await r.json()), ctx());
          results.push({ id: ch.value.leadgen_id, status: out.status });
        }
        return send(res, 200, { results });
      }

      // SWK OS -> Growth: lead status changes close the attribution loop.
      if (url.pathname === "/intake/os-webhook") {
        const sig = String(req.headers["x-swk-signature"] ?? "").replace(/^sha256=/, "");
        if (!config.intake.osWebhookSecret || !safeEqual(sig, hmacHex(config.intake.osWebhookSecret, raw))) return send(res, 401, { error: "Bad signature" });
        const evt = JSON.parse(raw.toString("utf8"));
        const rec = evt.data?.record ?? evt.data;
        const gid = /gid: (g_[0-9a-f]+)/.exec(rec?.notes ?? "")?.[1];
        if (gid && rec?.status) store.append({ t: "status", gid, status: rec.status, event: evt.event });
        return send(res, 200, { ok: true, matched: !!gid });
      }
      return send(res, 404, { error: "Not found" });
    } catch (e) {
      return send(res, e.status ?? (e instanceof SyntaxError ? 400 : 500), { error: e.status ? e.message : e instanceof SyntaxError ? "Invalid JSON" : "Internal error" });
    }
  };
  return http.createServer(handler);
}
