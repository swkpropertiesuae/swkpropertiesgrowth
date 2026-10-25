import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Download,
  Plus,
  Check,
  Layers,
  Target,
  FlaskConical,
  Waypoints,
} from "lucide-react";
import brand from "./brand.json";
type Note = {
  id: string;
  question: string;
  source: string;
  date: string;
  classification: string;
  confidence: string;
  assumption: string;
};
const modules = [
  "Opportunity Genome",
  "Buyer Intent Compiler",
  "Counterfactual Marketing Lab",
  "Market Digital Twin",
];
function useSaved<T>(key: string, initial: T): [T, (v: T) => void] {
  const [v, set] = useState<T>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("swkgrowth:" + key) ?? "null") ??
        initial
      );
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("swkgrowth:" + key, JSON.stringify(v));
    } catch {
      window.dispatchEvent(new CustomEvent("storage-error"));
    }
  }, [key, v]);
  return [v, set];
}
export default function Intelligence() {
  const [module, setModule] = useState(modules[0]),
    [notes, setNotes] = useSaved<Note[]>("evidence", []),
    [area, setArea] = useState("Dubai"),
    [type, setType] = useState("Apartment"),
    [matched, setMatched] = useState(false),
    [experiments, setExperiments] = useSaved<
      {
        hypothesis: string;
        alternative: string;
        budget: number;
        rule: string;
      }[]
    >("experiments", []),
    [volume, setVolume] = useState(100),
    [low, setLow] = useState(2),
    [high, setHigh] = useState(8),
    [cost, setCost] = useState(1000),
    [status, setStatus] = useState("");
  const valid =
    Number.isFinite(volume) &&
    volume >= 0 &&
    Number.isFinite(low) &&
    low >= 0 &&
    Number.isFinite(high) &&
    high <= 100 &&
    high >= low &&
    Number.isFinite(cost) &&
    cost >= 0;
  function exportEvidence() {
    const body = JSON.stringify(
      {
        label: "Illustrative browser-local evidence and experiments",
        notes,
        experiments,
      },
      null,
      2,
    );
    const u = URL.createObjectURL(
      new Blob([body], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "swkgrowth-intelligence.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <>
      <div className="notice">
        <Layers size={22} />
        <p>
          <strong>Explore the core intelligence tools.</strong>
          <br />
          User-supplied evidence and deterministic calculations only. No
          discovery feed, buyer data collection, predictive model, or
          calibration service is connected.
        </p>
      </div>
      <div className="intelligence-tabs">
        {modules.map((n, i) => {
          const Icon = [Layers, Target, FlaskConical, Waypoints][i];
          return (
            <button
              className={module === n ? "selected" : ""}
              key={n}
              onClick={() => {
                setModule(n);
                setStatus("");
              }}
            >
              <Icon size={18} />
              {n}
            </button>
          );
        })}
      </div>
      {module === modules[0] && (
        <div className="two-columns">
          <section className="panel">
            <span className="badge">Research canvas · Unvalidated</span>
            <h2>Start with a question worth checking.</h2>
            <p>
              Document a potential demand gap and the evidence needed to
              evaluate it. A saved source is a reference, not automatic
              verification.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                setNotes([
                  {
                    id: "ev-" + Date.now(),
                    question: String(d.get("question")),
                    source: String(d.get("source")),
                    date: String(d.get("date")),
                    classification: String(d.get("classification")),
                    confidence: String(d.get("confidence")),
                    assumption: String(d.get("assumption")),
                  },
                  ...notes,
                ]);
                e.currentTarget.reset();
                setStatus(
                  "Research note saved in this browser. No opportunity has been verified.",
                );
              }}
            >
              <label>
                Opportunity or research question
                <input
                  name="question"
                  required
                  maxLength={200}
                  placeholder="What audience need are we testing?"
                />
              </label>
              <label>
                Source URL
                <input
                  name="source"
                  type="url"
                  required
                  placeholder="https://…"
                />
              </label>
              <div className="form-grid">
                <label>
                  Date checked
                  <input name="date" type="date" required />
                </label>
                <label>
                  Classification
                  <select name="classification">
                    <option>Observed</option>
                    <option>Inferred</option>
                    <option>Forecast</option>
                  </select>
                </label>
              </div>
              <label>
                Confidence (self-assessed)
                <select name="confidence">
                  <option>Low / unvalidated</option>
                  <option>Medium / review needed</option>
                  <option>High / user-assessed</option>
                </select>
              </label>
              <label>
                Assumptions and what would disprove the idea
                <textarea name="assumption" required rows={3} />
              </label>
              <button className="btn dark small">
                <Plus size={16} /> Save research note
              </button>
            </form>
          </section>
          <section className="panel">
            <h2>Evidence ledger</h2>
            {notes.length ? (
              notes.map((n) => (
                <article className="evidence-note" key={n.id}>
                  <span className="badge">
                    {n.classification} · {n.confidence}
                  </span>
                  <h3>{n.question}</h3>
                  <p>{n.assumption}</p>
                  <a
                    className="text-link"
                    href={/^https?:\/\//.test(n.source) ? n.source : undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    User-supplied source <ArrowUpRight size={14} />
                  </a>
                  <p className="source-note">
                    Checked by user: {n.date}. Not independently verified.
                  </p>
                </article>
              ))
            ) : (
              <div className="empty">
                <Layers />
                <h3>No research notes yet.</h3>
                <p>
                  Record a source, date and assumption to give your next
                  discussion context.
                </p>
              </div>
            )}
            <button className="text-link" onClick={exportEvidence}>
              <Download size={16} /> Export intelligence notes
            </button>
          </section>
        </div>
      )}
      {module === modules[1] && (
        <>
          <section className="panel">
            <span className="badge">
              Voluntary synthetic brief · Explainable criteria
            </span>
            <h2>Turn a broad brief into a clearer shortlist.</h2>
            <p>
              Compare the brief with the three source portfolio records. No
              personal buyer details are collected. This is a source showcase,
              not available inventory or a suitability recommendation.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMatched(true);
              }}
            >
              <div className="form-grid">
                <label>
                  Location / emirate
                  <select
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      setMatched(false);
                    }}
                  >
                    <option>Dubai</option>
                    <option>Abu Dhabi</option>
                    <option>Any</option>
                  </select>
                </label>
                <label>
                  Property type
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setMatched(false);
                    }}
                  >
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Any</option>
                  </select>
                </label>
              </div>
              <button className="btn dark small">
                <Target size={16} /> Compile source matches
              </button>
            </form>
          </section>
          {matched && (
            <div className="record-grid intelligence-results">
              {brand.properties
                .filter(
                  (p) =>
                    (area === "Any" || p.emirate === area) &&
                    (type === "Any" || p.type === type),
                )
                .map((p) => (
                  <article className="panel" key={p.id}>
                    <span className="badge">
                      Provisional source match · Not a recommendation
                    </span>
                    <h2>{p.title}</h2>
                    <p>
                      Matched because source emirate is {p.emirate} and property
                      type is {p.type}. Community: {p.community}.
                    </p>
                    <p className="source-note">
                      No price, availability, suitability or buyer-intent score
                      is asserted. Source snapshot: 25 Oct 2026.
                    </p>
                    <a
                      className="text-link"
                      href={brand.site.url + "/properties/" + p.id + "/"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Review source property <ArrowUpRight size={15} />
                    </a>
                  </article>
                ))}
              {!brand.properties.some(
                (p) =>
                  (area === "Any" || p.emirate === area) &&
                  (type === "Any" || p.type === type),
              ) && (
                <div className="panel empty">
                  <Target />
                  <h3>No source records match these criteria.</h3>
                  <p>
                    Change the brief or request current information from SWK
                    Properties.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {module === modules[2] && (
        <div className="two-columns">
          <section className="panel">
            <span className="badge">
              Hypothesis comparison · Internal planning
            </span>
            <h2>Test a question before you scale an idea.</h2>
            <p>
              Define two approaches, an illustrative budget and a stopping rule.
              Saving never launches a campaign or allocates money.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                setExperiments([
                  {
                    hypothesis: String(d.get("hypothesis")),
                    alternative: String(d.get("alternative")),
                    budget: Number(d.get("budget")),
                    rule: String(d.get("rule")),
                  },
                  ...experiments,
                ]);
                e.currentTarget.reset();
                setStatus(
                  "Experiment saved as an internal plan. No campaign was launched.",
                );
              }}
            >
              <label>
                Hypothesis A
                <textarea
                  name="hypothesis"
                  required
                  rows={3}
                  placeholder="What should this approach help us learn?"
                />
              </label>
              <label>
                Counterfactual / approach B
                <textarea
                  name="alternative"
                  required
                  rows={3}
                  placeholder="What would we compare it with?"
                />
              </label>
              <label>
                Illustrative test budget (USD)
                <input name="budget" type="number" min="0" required />
              </label>
              <label>
                Metric, sample limitations, review date & stopping rule
                <textarea name="rule" required rows={3} />
              </label>
              <button className="btn dark small">
                <Plus size={16} /> Save experiment draft
              </button>
            </form>
          </section>
          <section className="panel">
            <h2>Your learning backlog</h2>
            {experiments.length ? (
              experiments.map((x, i) => (
                <article className="evidence-note" key={i}>
                  <span className="badge">Draft · No results collected</span>
                  <h3>A: {x.hypothesis}</h3>
                  <p>B: {x.alternative}</p>
                  <p>Illustrative budget: USD {x.budget.toLocaleString()}</p>
                  <p>Review rule: {x.rule}</p>
                  <p className="source-note">
                    Source: user-entered assumptions. Confidence: low /
                    unvalidated. Any public release or spending requires
                    authorization outside this demo.
                  </p>
                </article>
              ))
            ) : (
              <div className="empty">
                <FlaskConical />
                <h3>A good experiment begins with a stopping rule.</h3>
                <p>Add your first comparison to the learning backlog.</p>
              </div>
            )}
          </section>
        </div>
      )}
      {module === modules[3] && (
        <div className="two-columns">
          <section className="panel">
            <span className="badge">
              What-if arithmetic · Uncalibrated scenario
            </span>
            <h2>See what your assumptions change.</h2>
            <p>
              This simplified scenario calculator is not a digital replica of a
              real market. It has no historical calibration or predictive
              accuracy claim.
            </p>
            <label>
              Hypothetical visits
              <input
                type="number"
                min="0"
                value={volume}
                onChange={(e) => setVolume(e.target.valueAsNumber)}
              />
            </label>
            <div className="form-grid">
              <label>
                Low enquiry rate (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={low}
                  onChange={(e) => setLow(e.target.valueAsNumber)}
                />
              </label>
              <label>
                High enquiry rate (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={high}
                  onChange={(e) => setHigh(e.target.valueAsNumber)}
                />
              </label>
            </div>
            <label>
              Hypothetical spend (USD)
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.valueAsNumber)}
              />
            </label>
            <p className="source-note">
              Assumes a constant user-entered enquiry rate and no channel
              effects. Does not calculate sales, returns, or market demand.
            </p>
          </section>
          <section className="panel roi-results">
            <span className="badge">
              Illustrative range · Not a confidence interval
            </span>
            <h2>One assumption, several outcomes.</h2>
            {valid ? (
              <>
                {[
                  ["Low scenario", low],
                  ["Midpoint scenario", (low + high) / 2],
                  ["High scenario", high],
                ].map(([label, rate]) => {
                  const n = (volume * Number(rate)) / 100;
                  return (
                    <div className="scenario-row" key={label}>
                      <strong>{label}</strong>
                      <div className="stat">
                        {n.toFixed(1)}
                        <small> hypothetical enquiries</small>
                      </div>
                      <p>
                        {Number(rate).toFixed(1)}% input rate ·{" "}
                        {n > 0
                          ? "USD " + (cost / n).toFixed(2) + " cost per enquiry"
                          : "Cost per enquiry is undefined at zero enquiries."}
                      </p>
                    </div>
                  );
                })}
                <p className="source-note">
                  Expected enquiries = visits × user-entered rate ÷ 100. Cost
                  per enquiry = spend ÷ expected enquiries. Calibration ledger:
                  no observed outcomes recorded; confidence unassessed.
                </p>
              </>
            ) : (
              <p role="alert">
                Enter finite non-negative visits and spend, and rates between 0
                and 100 with the high rate at least equal to the low rate.
              </p>
            )}
          </section>
        </div>
      )}
      {status && (
        <p className="local-success" role="status">
          <Check size={16} />
          {status}
        </p>
      )}
    </>
  );
}
