import { processLead } from "../src/growth/pipeline.mjs";
import { toOsLead } from "./os-crm.mjs";
import { assertSeats } from "../src/growth/access.mjs";

/**
 * Runs one raw lead through the pipeline and (optionally) into SWK OS.
 * ctx: { store, os, team, ownerIds, campaignIds }
 */
export async function syncLead(raw, ctx) {
  const { store, os, team = {}, ownerIds = {}, campaignIds = {} } = ctx;
  const p = processLead(raw, { seen: store.seen, team });
  p.gid = store.gid(p.keys.length ? p.keys : [JSON.stringify(raw)]);
  if (p.duplicate) {
    // Repeat enquiry: annotate the existing OS lead instead of creating another one (repeat interest is a signal).
    const known = p.keys.map((k) => store.byKey.get(k)).find(Boolean);
    const osId = known && store.leads.get(known)?.osId;
    if (osId) {
      await os.addNote(osId, `${new Date().toISOString().slice(0, 16)} repeat enquiry via ${p.lead.channel}${p.lead.campaign ? ` / ${p.lead.campaign}` : ""}`);
      return { status: "merged", osId, ...p };
    }
    return { status: "duplicate", ...p };
  }
  if (p.assignment.queue === "none") return { status: "rejected", ...p };
  if (p.assignment.queue === "signal") return { status: "signal-only", ...p };

  const existing = await os.findExisting({ gid: p.gid, phone: p.lead.phone, email: p.lead.email }).catch(() => null);
  if (existing) {
    await os.addNote(existing.id, `${new Date().toISOString().slice(0, 16)} repeat enquiry via ${p.lead.channel}${p.lead.campaign ? ` / ${p.lead.campaign}` : ""}`);
    return { status: "merged", osId: existing.id, ...p };
  }
  const payload = toOsLead(p, { ownerIds, campaignIds });
  const res = await os.createLead(payload);
  if (!res.dryRun) store.append({ t: "lead", gid: p.gid, keys: p.keys, osId: res.id, queue: p.assignment.queue, status: "New" });
  return { status: res.dryRun ? "dry-run" : "created", osId: res.id, payload, ...p };
}

export { assertSeats };
