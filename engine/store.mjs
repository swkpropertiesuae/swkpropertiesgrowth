// Tiny append-only JSONL ledger. Holds dedupe keys, created OS ids and the public-signal queue. Replace with a database in production.
// Dedupe keys (phone / e-mail) are stored only as truncated SHA-256 hashes, so the file holds no raw contact details.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const hashKey = (k) => (k.startsWith("h:") ? k : "h:" + crypto.createHash("sha256").update(k).digest("hex").slice(0, 32));
class HashedSet { #s = new Set(); add(k) { this.#s.add(hashKey(k)); return this; } has(k) { return this.#s.has(hashKey(k)); } get size() { return this.#s.size; } }
class HashedMap { #m = new Map(); set(k, v) { this.#m.set(hashKey(k), v); return this; } get(k) { return this.#m.get(hashKey(k)); } }

export class Store {
  constructor(dir = process.env.GROWTH_DATA_DIR || "./data/runtime") {
    this.dir = dir; fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, "ledger.jsonl");
    this.seen = new HashedSet(); this.leads = new Map(); this.byKey = new HashedMap(); this.signals = [];
    if (fs.existsSync(this.file)) for (const line of fs.readFileSync(this.file, "utf8").split("\n").filter(Boolean)) this.#apply(JSON.parse(line));
  }
  #apply(e) {
    if (e.t === "lead") { e.keys.forEach((k) => { this.seen.add(k); this.byKey.set(k, e.gid); }); this.leads.set(e.gid, e); }
    if (e.t === "status") { const l = this.leads.get(e.gid); if (l) l.status = e.status; }
    if (e.t === "signal") this.signals.push(e.signal);
    if (e.t === "purge") this.signals = this.signals.filter((s) => s.url !== e.url);
  }
  append(e) {
    const stored = e.keys ? { ...e, keys: e.keys.map(hashKey) } : e;
    fs.appendFileSync(this.file, JSON.stringify({ ...stored, at: new Date().toISOString() }) + "\n", { mode: 0o600 });
    this.#apply(stored);
  }
  gid(keys) { return "g_" + crypto.createHash("sha256").update(keys.join("|")).digest("hex").slice(0, 16); }
}
