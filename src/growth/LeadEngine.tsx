import { useMemo, useState } from "react";
import { Check, ShieldCheck, Send, X } from "lucide-react";
import { processLead } from "./pipeline.mjs";
import { GROWTH_ROLES, POLICY, ACTIONS, MAX_SEATS, can } from "./access.mjs";
import { CITY_LIST } from "./cities.mjs";
import { toOsLead } from "../../engine/os-crm.mjs";

const CHANNELS = ["instagram", "facebook", "tiktok", "youtube", "linkedin", "x", "telegram", "whatsapp", "web_form", "portal", "event", "referral"];
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function LeadEngine({ role }: { role: string }) {
  const [f, setF] = useState({
    name: "Priya Nair", phone: "+91 98470 12345", email: "priya@example.com", channel: "instagram", city: "Kochi", countryCode: "IN",
    budgetAed: 1200000, timeline: "1-3m", purpose: "investment", finance: "unknown",
    askedViewing: true, askedCallback: false, askedPrice: true, consent: true, enquiry: true, agentActive: 3, agentOnShift: true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const result = useMemo(() => {
    const team = { agent: { activeLeads: f.agentActive, shift: f.agentOnShift ? { days: ALL_DAYS, start: "00:00", end: "23:59" } : { days: [], start: "09:00", end: "19:00" } } };
    return processLead(
      {
        name: f.name, phone: f.phone, email: f.email, channel: f.channel, city: f.city, countryCode: f.countryCode, budgetAed: f.budgetAed,
        timeline: f.timeline, purpose: f.purpose, finance: f.finance,
        intent: { askedViewing: f.askedViewing, askedCallback: f.askedCallback, askedPrice: f.askedPrice, formSubmitted: f.enquiry },
        consent: { marketing: f.consent, basis: f.consent ? "consent" : f.enquiry ? "enquiry" : "none" },
      },
      { team },
    );
  }, [f]);
  const payload = useMemo(() => toOsLead({ ...result, gid: "g_preview" }, { ownerIds: {} }), [result]);
  const mayView = can(role, "view_dashboard");
  const tone = result.scored.band === "hot" ? "ok" : result.scored.band === "warm" ? "warn" : "";
  return (
    <>
      <div className="notice">
        <Send size={21} />
        <p>
          <strong>Lead engine simulator.</strong>
          <br />
          Runs the same scoring, consent and routing code as the Node engine, on synthetic input typed here. Nothing is sent to SWK OS from the browser; production
          sync runs server-side with an API key.
        </p>
      </div>
      {!mayView ? (
        <p role="alert">Your role cannot open this page.</p>
      ) : (
        <div className="two-columns">
          <section className="panel">
            <h2>Test a lead</h2>
            <div className="form-grid">
              <label>Name<input value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
              <label>Phone<input value={f.phone} onChange={(e) => set("phone", e.target.value)} /></label>
              <label>Email<input value={f.email} onChange={(e) => set("email", e.target.value)} /></label>
              <label>Channel<select value={f.channel} onChange={(e) => set("channel", e.target.value)}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label>City<input list="le-cities" value={f.city} onChange={(e) => { set("city", e.target.value); const c = CITY_LIST.find((x: { name: string }) => x.name.toLowerCase() === e.target.value.toLowerCase()); if (c) set("countryCode", c.country); }} /></label>
              <datalist id="le-cities">{CITY_LIST.slice(0, 700).map((c: { id: string; name: string }) => <option key={c.id} value={c.name} />)}</datalist>
              <label>Budget (AED)<input type="number" min="0" value={f.budgetAed} onChange={(e) => set("budgetAed", Number(e.target.value))} /></label>
              <label>Timeline<select value={f.timeline} onChange={(e) => set("timeline", e.target.value)}>{["immediate", "1-3m", "3-6m", "6m+", "unknown"].map((c) => <option key={c}>{c}</option>)}</select></label>
              <label>Purpose<select value={f.purpose} onChange={(e) => set("purpose", e.target.value)}>{["investment", "residence", "golden_visa", "unknown"].map((c) => <option key={c}>{c}</option>)}</select></label>
              <label>Agent active leads<input type="number" min="0" value={f.agentActive} onChange={(e) => set("agentActive", Number(e.target.value))} /></label>
            </div>
            <div className="check-row">
              {([["askedViewing", "Asked for a viewing"], ["askedCallback", "Asked for a call-back"], ["askedPrice", "Asked for prices"], ["enquiry", "Contacted us (enquiry)"], ["consent", "Ticked marketing consent"], ["agentOnShift", "Agent on shift"]] as const).map(([k, l]) => (
                <label key={k}><input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} /> {l}</label>
              ))}
            </div>
          </section>
          <section className="panel">
            <span className={"badge " + tone}>{result.scored.band.toUpperCase()}</span>
            <h2>Score {result.scored.score}/100 → {result.assignment.queue}</h2>
            <p>{result.assignment.reason}{result.assignment.slaMinutes ? ` · first response within ${result.assignment.slaMinutes} min` : ""}</p>
            <ul className="reasons">{result.scored.reasons.map((r: string) => <li key={r}>{r}</li>)}</ul>
            <h3>What SWK OS would receive</h3>
            {result.assignment.queue === "none" || result.assignment.queue === "signal" ? (
              <p>Nothing. {result.assignment.queue === "signal" ? "A person replies publicly from the brand account; no lead is created." : "Rejected or duplicate."}</p>
            ) : (
              <pre className="saved-plan">{JSON.stringify(payload, null, 2)}</pre>
            )}
          </section>
        </div>
      )}
      <section className="panel" style={{ marginTop: 18 }}>
        <h2><ShieldCheck size={18} /> Who can do what</h2>
        <p>
          Five roles, one seat each ({GROWTH_ROLES.map((r: string) => `${r} ${MAX_SEATS[r as keyof typeof MAX_SEATS]}`).join(" · ")}). This table is the policy; real enforcement is in
          SWK OS roles and the server, not in this browser. You are previewing as <strong>{role}</strong>.
        </p>
        <div className="table-wrap">
          <table className="matrix">
            <thead><tr><th>Action</th>{GROWTH_ROLES.map((r: string) => <th key={r} className={r === role ? "me" : ""}>{r}</th>)}</tr></thead>
            <tbody>
              {ACTIONS.map((a: string) => (
                <tr key={a}>
                  <td>{a.replaceAll("_", " ")}</td>
                  {GROWTH_ROLES.map((r: string) => {
                    const allowed = POLICY[r as keyof typeof POLICY].has(a);
                    return <td key={r} aria-label={allowed ? "allowed" : "not allowed"}>{allowed ? <Check size={14} /> : <X size={14} className="no" />}{r === "Agent" && allowed && (a === "view_pii" || a === "edit_lead") ? <small> own</small> : null}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
