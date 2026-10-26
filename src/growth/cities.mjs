import { COUNTRIES, CITIES, ARCHETYPES } from "./city-seed.mjs";

const WAVE2 = new Set(["South Asia", "GCC", "Levant, Iraq & Iran", "North Africa", "Turkey & Cyprus"]);
const WAVE3 = new Set([
  "Western Europe", "Southern Europe", "Nordics & Baltics", "Central & Eastern Europe",
  "Russia & CIS", "Central Asia & Caucasus", "Sub-Saharan Africa",
]);
const RTL = new Set(["ar", "fa", "ur", "he"]);

export const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function waveFor(tier, region) {
  if (tier === 0) return 0;
  if (tier === 1) return 1;
  if (WAVE2.has(region)) return 2;
  if (WAVE3.has(region)) return 3;
  return 4;
}

function parseToken(token) {
  let rest = token, tz, lang, tier1 = false;
  const at = rest.indexOf("@");
  if (at >= 0) { tz = rest.slice(at + 1); rest = rest.slice(0, at); }
  const bar = rest.indexOf("|");
  if (bar >= 0) { lang = rest.slice(bar + 1); rest = rest.slice(0, bar); }
  if (rest.endsWith("*")) { tier1 = true; rest = rest.slice(0, -1); }
  return { name: rest, tz, lang, tier1 };
}

export function buildCities() {
  const out = [], seen = new Set();
  for (const [cc, tokens] of Object.entries(CITIES)) {
    const [countryName, region, currency, langs, defaultTz, archetype] = COUNTRIES[cc];
    for (const token of tokens) {
      const { name, tz, lang, tier1 } = parseToken(token);
      const id = `${cc.toLowerCase()}-${slugify(name)}`;
      if (seen.has(id)) throw new Error(`Duplicate city id ${id}`);
      seen.add(id);
      const base = langs.split(",");
      const languages = lang ? [lang, ...base.filter((l) => l !== lang)] : base;
      const tier = cc === "AE" ? 0 : tier1 ? 1 : 2;
      out.push({
        id, name, country: cc, countryName, region, tier,
        wave: waveFor(tier, region),
        tz: tz ?? defaultTz, currency, languages,
        rtl: RTL.has(languages[0]),
        archetype,
        channels: ARCHETYPES[archetype].channels,
      });
    }
  }
  return out;
}

export const CITY_LIST = buildCities();
export const cityById = (id) => CITY_LIST.find((c) => c.id === id);
export { ARCHETYPES };

/** @param {{q?: string, tier?: number|string, region?: string, wave?: number|string, archetype?: string, country?: string}} [opts] */
export function filterCities({ q = "", tier, region, wave, archetype, country } = {}) {
  const needle = q.trim().toLowerCase();
  return CITY_LIST.filter(
    (c) =>
      (tier === undefined || tier === "" || c.tier === Number(tier)) &&
      (!region || c.region === region) &&
      (wave === undefined || wave === "" || c.wave === Number(wave)) &&
      (!archetype || c.archetype === archetype) &&
      (!country || c.country === country) &&
      (!needle || `${c.name} ${c.countryName} ${c.region}`.toLowerCase().includes(needle)),
  );
}

export function cityStats(list = CITY_LIST) {
  const by = (key) => list.reduce((m, c) => ((m[c[key]] = (m[c[key]] ?? 0) + 1), m), {});
  return {
    total: list.length,
    countries: new Set(list.map((c) => c.country)).size,
    byTier: by("tier"), byWave: by("wave"), byRegion: by("region"),
    languages: new Set(list.flatMap((c) => c.languages)).size,
  };
}

// ---- time zones ------------------------------------------------------------
export function utcOffsetMinutes(tz, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+v.year, +v.month - 1, +v.day, +v.hour, +v.minute, +v.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}
export const GST = "Asia/Dubai";
export const gstDiffMinutes = (tz, date = new Date()) =>
  utcOffsetMinutes(GST, date) - utcOffsetMinutes(tz, date);

// A local-time window (hours, 0-24) expressed in GST minutes-of-day ranges (may wrap past midnight).
export function windowInGst(tz, startHour, endHour, date = new Date()) {
  const diff = gstDiffMinutes(tz, date);
  const mod = (m) => ((m % 1440) + 1440) % 1440;
  return { start: mod(startHour * 60 + diff), end: mod(endHour * 60 + diff) };
}
export const fmtMinutes = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// Minutes of overlap between two minute-of-day windows that may wrap past midnight.
export function overlapMinutes(a, b) {
  const split = (w) => (w.start <= w.end ? [[w.start, w.end]] : [[w.start, 1440], [0, w.end]]);
  let total = 0;
  for (const [s1, e1] of split(a)) for (const [s2, e2] of split(b)) total += Math.max(0, Math.min(e1, e2) - Math.max(s1, s2));
  return total;
}
