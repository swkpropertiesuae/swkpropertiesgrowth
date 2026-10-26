import { canonicalLead, dedupeKeys, osSource } from "./normalize.mjs";
import { scoreLead, DEFAULT_SCORING } from "./scoring.mjs";
import { assignLead, DEFAULT_ROUTING } from "./assign.mjs";
import { CITY_LIST } from "./cities.mjs";

const cityIndex = new Map(CITY_LIST.map((c) => [`${c.country}:${c.name.toLowerCase()}`, c]));
const nameIndex = new Map();
for (const c of CITY_LIST) if (!nameIndex.has(c.name.toLowerCase())) nameIndex.set(c.name.toLowerCase(), c);

export function matchCity(lead) {
  const n = lead.city.toLowerCase();
  return cityIndex.get(`${lead.countryCode}:${n}`) ?? nameIndex.get(n) ?? null;
}

/**
 * ingest -> normalise -> consent -> dedupe -> score -> assign.
 * `seen` is a Set of dedupe keys (the store passes its own); the function adds keys for accepted leads.
 */
export function processLead(raw, { seen = new Set(), team = {}, scoring = DEFAULT_SCORING, routing = DEFAULT_ROUTING, now = new Date(), defaultCountry = "AE" } = {}) {
  const lead = canonicalLead(raw, { defaultCountry, now });
  const keys = dedupeKeys(lead);
  const duplicate = keys.some((k) => seen.has(k));
  const city = matchCity(lead);
  const scored = scoreLead(lead, { tier: city?.tier ?? 2, duplicate, config: scoring });
  const assignment = assignLead(lead, scored, team, routing, now);
  if (assignment.queue !== "none") keys.forEach((k) => seen.add(k));
  return { lead, city: city?.id ?? null, scored, assignment, duplicate, keys, osSource: osSource(lead.channel) };
}
