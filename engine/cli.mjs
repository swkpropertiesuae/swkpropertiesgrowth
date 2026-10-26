#!/usr/bin/env node
import fs from "node:fs";
import { parseArgs } from "node:util";
import { loadConfig } from "./config.mjs";
import { OsClient } from "./os-crm.mjs";
import { Store } from "./store.mjs";
import { syncLead } from "./sync.mjs";
import { fromCsvRow } from "./mappers.mjs";
import { createIntakeServer } from "./intake-server.mjs";
import { parseCsv } from "../src/growth/csv.mjs";
import { CITY_LIST, cityById, filterCities, cityStats } from "../src/growth/cities.mjs";
import { cityBrief } from "../src/growth/content.mjs";
import { osRoleDefinitions } from "../src/growth/access.mjs";
import { toSignal } from "../src/growth/signals.mjs";

const { positionals, values: v } = parseArgs({
  allowPositionals: true,
  options: {
    tier: { type: "string" }, region: { type: "string" }, wave: { type: "string" }, q: { type: "string" }, json: { type: "boolean" },
    channel: { type: "string", default: "web_form" }, campaign: { type: "string" }, country: { type: "string" }, basis: { type: "string" },
    send: { type: "boolean" },
  },
});
const [cmd, arg] = positionals;
const cfg = loadConfig();
const out = (x) => console.log(typeof x === "string" ? x : JSON.stringify(x, null, 2));

const help = `SWK Growth engine
  cities [--tier 0|1|2] [--wave N] [--region R] [--q text] [--json]   list the city programme (${CITY_LIST.length} cities)
  brief <city-id>                                                       content brief for one city
  import <file.csv> [--channel instagram] [--country IN] [--basis enquiry|none] [--campaign X] [--send]
                                                                        run a lead export through scoring and (with --send) into SWK OS
  signal "<public post text>" --channel x --q <url>                     classify a public post as an intent signal
  roles                                                                 SWK OS role definitions for Growth access
  serve                                                                 start the signed intake server
Dry-run is the default: nothing is written to SWK OS unless --send (or OS_SEND=true) is set.`;

async function main() {
  if (!cmd || cmd === "help") return out(help);
  if (cmd === "cities") {
    const list = filterCities({ tier: v.tier, wave: v.wave, region: v.region, q: v.q });
    if (v.json) return out(list);
    out(`${list.length} cities\n` + list.map((c) => `${c.id.padEnd(30)} T${c.tier} W${c.wave} ${c.countryName.padEnd(24)} ${c.languages.join("/")}`).join("\n"));
    return out(cityStats(list));
  }
  if (cmd === "brief") {
    const c = cityById(arg); if (!c) throw new Error(`Unknown city id "${arg}". Try: cities --q ${arg ?? "name"}`);
    return out(cityBrief(c));
  }
  if (cmd === "roles") return out(osRoleDefinitions());
  if (cmd === "signal") {
    const s = toSignal({ platform: v.channel, url: v.q ?? "", handle: "", text: arg });
    return out(s ?? "Not an intent signal (no match, or promotional/competitor post). Nothing stored.");
  }
  if (cmd === "import") {
    if (!arg) throw new Error("import needs a CSV file");
    const send = v.send || cfg.os.send;
    const os = new OsClient({ ...cfg.os, send });
    const store = new Store(cfg.dataDir);
    const rows = parseCsv(fs.readFileSync(arg, "utf8"));
    const tally = {};
    for (const row of rows) {
      const raw = fromCsvRow(row, { channel: v.channel, defaultCountry: v.country, basis: v.basis });
      if (v.campaign && !raw.campaign) raw.campaign = v.campaign;
      const r = await syncLead(raw, { store, os, team: { agent: { activeLeads: 0, shift: cfg.agentShift } }, ownerIds: cfg.owners });
      tally[r.status] = (tally[r.status] ?? 0) + 1;
      console.log(`${r.status.padEnd(11)} ${String(r.scored.score).padStart(3)} ${r.scored.band.padEnd(9)} ${r.assignment.queue.padEnd(7)} ${r.lead.name || r.lead.phone || r.lead.email}`);
    }
    out({ mode: send ? "SENT to SWK OS" : "DRY RUN (nothing written)", rows: rows.length, ...tally });
    return;
  }
  if (cmd === "serve") {
    const store = new Store(cfg.dataDir);
    const os = new OsClient({ ...cfg.os });
    const server = createIntakeServer({ config: cfg, store, os, team: () => ({ agent: { activeLeads: 0, shift: cfg.agentShift } }) });
    server.listen(cfg.intake.port, () => console.log(`Intake listening on :${cfg.intake.port} (OS writes ${cfg.os.send ? "ENABLED" : "disabled: dry-run"})`));
    return;
  }
  throw new Error(`Unknown command "${cmd}"\n${help}`);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
