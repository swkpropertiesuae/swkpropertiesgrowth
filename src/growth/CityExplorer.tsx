import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { CITY_LIST, cityStats, filterCities } from "./cities.mjs";
import { cityBrief } from "./content.mjs";

type City = (typeof CITY_LIST)[number];
const PAGE = 60;
const WAVE_LABEL: Record<number, string> = { 0: "Always on", 1: "Wave 1 · weeks 1–4", 2: "Wave 2 · weeks 5–8", 3: "Wave 3 · weeks 9–12", 4: "Wave 4 · weeks 13–16" };

export function CityPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState(""), [tier, setTier] = useState(""), [limit, setLimit] = useState(PAGE);
  const stats = useMemo(() => cityStats(), []);
  const list = useMemo(() => filterCities({ q, tier }), [q, tier]);
  return (
    <>
      <p>
        <strong>{stats.total}</strong> cities · <strong>{stats.countries}</strong> countries · <strong>{stats.languages}</strong> languages. Tier 0 = UAE home, Tier 1 / 2 =
        planning priority to be re-ranked from our own CRM data.
      </p>
      <div className="form-grid">
        <label>Find a city<input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="City, country or region…" /></label>
        <label>Tier<select value={tier} onChange={(e) => { setTier(e.target.value); setLimit(PAGE); }}><option value="">All tiers</option><option value="0">Tier 0 (UAE)</option><option value="1">Tier 1</option><option value="2">Tier 2</option></select></label>
      </div>
      <div className="city-list">
        {list.slice(0, limit).map((c: City) => (
          <button key={c.id} className={value === c.id ? "selected" : ""} onClick={() => onChange(c.id)} title={`${c.countryName} · Tier ${c.tier}`}>
            <MapPin size={15} />{c.name}<small>{c.country}</small>
          </button>
        ))}
      </div>
      {list.length === 0 && <p>No matching cities. Try another search.</p>}
      {list.length > limit && <button className="text-link" onClick={() => setLimit((n) => n + PAGE)}>Show more ({list.length - limit} left)</button>}
    </>
  );
}

export function CityBrief({ city }: { city: City }) {
  const b = useMemo(() => cityBrief(city), [city]);
  return (
    <div className="city-brief">
      <p>
        <span className="badge">Tier {city.tier}</span> <span className="badge">{WAVE_LABEL[city.wave]}</span> <span className="badge">{city.currency}</span>
        {city.rtl && <span className="badge">Right-to-left</span>}
      </p>
      <p><strong>Languages:</strong> {b.languages.map((l: { name: string }) => l.name).join(", ")}</p>
      <p><strong>Channels (priority order):</strong> {b.channels.map((c: { channel: string }) => c.channel).join(" → ")}</p>
      <p><strong>Cadence:</strong> {b.cadence}</p>
      <p><strong>Best posting windows:</strong> {b.postingWindows.map((w: { label: string; gst: string }) => `${w.label} = ${w.gst}`).join(" · ")}</p>
      <p><strong>Hashtags:</strong> {b.hashtags.join(" ")}</p>
      <p className="muted">{b.note}</p>
      <details>
        <summary>12 content pillars for {city.name}</summary>
        <ol>{b.pillars.map((p: { id: string; title: string; hook: string; cta: string; format: string }) => <li key={p.id}><strong>{p.title}</strong> ({p.format})<br />{p.hook}<br /><em>{p.cta}</em></li>)}</ol>
      </details>
      <details>
        <summary>Lead magnets and compliance checklist</summary>
        <ul>{b.leadMagnets.map((m: string) => <li key={m}>{m}</li>)}</ul>
        <ul>{b.complianceChecklist.map((m: string) => <li key={m}>{m}</li>)}</ul>
      </details>
    </div>
  );
}
