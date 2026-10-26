import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  ChartNoAxesCombined,
  Layers,
  Target,
  Sparkles,
  ShieldCheck,
  Globe,
  MoveUpRight,
  Plus,
  Check,
  ChevronDown,
} from "lucide-react";
import brand from "./brand.json";
import { insights } from "./data";
import Workspace from "./workspace";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "./style.css";
export function Logo() {
  return (
    <span className="logo">
      <span className="logo-icon">
        <ChartNoAxesCombined size={22} />
      </span>
      <span>
        SWK<span className="light-weight">Growth</span>
      </span>
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-btn"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Landing() {
  const [menu, setMenu] = useState(false),
    [modal, setModal] = useState(""),
    [article, setArticle] = useState(-1),
    [annual, setAnnual] = useState(false),
    [chat, setChat] = useState(false),
    [question, setQuestion] = useState(""),
    [messages, setMessages] = useState<string[]>([]),
    [prepared, setPrepared] = useState(false),
    [mailHref, setMailHref] = useState("mailto:" + brand.site.email);
  const contact = () => {
    setPrepared(false);
    setModal("Let’s talk about your next chapter.");
  };
  return (
    <>
      <div className="announcement">
        <span>Built around people. Grounded in evidence.</span>
        <a href="#approach">
          Discover our approach <ArrowUpRight size={13} />
        </a>
      </div>
      <header className="site-header">
        <a href="#" aria-label="SWKGrowth home">
          <Logo />
        </a>
        <nav
          className={menu ? "site-nav open" : "site-nav"}
          aria-label="Main navigation"
        >
          {[
            ["Solutions", "solutions"],
            ["SWK Properties", "partner"],
            ["Our team", "team"],
            ["Insights", "insights"],
          ].map(([n, id]) => (
            <a key={id} href={"#" + id} onClick={() => setMenu(false)}>
              {n}
            </a>
          ))}
          <a className="mobile-only" href="#/app">
            Demo workspace
          </a>
        </nav>
        <div className="nav-actions">
          <a className="quiet workspace-link" href="#/app">
            Workspace <ArrowUpRight size={15} />
          </a>
          <button className="btn dark small" onClick={contact}>
            Let’s grow <ArrowUpRight size={16} />
          </button>
          <button
            className="icon-btn mobile-only"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="dot" /> SOLUTIONS. GROWTH. PROPERTY.
            </div>
            <h1>
              A new perspective
              <br />
              on real estate
              <br />
              <span className="serif">growth.</span>
              <span className="headline-arrow">
                <MoveUpRight />
              </span>
            </h1>
            <p className="hero-desc">
              The real estate growth engine.
              <br />
              Thoughtful strategy, standout digital experiences, and a clearer
              path from first impression to meaningful conversation.
            </p>
            <div className="button-row">
              <a className="btn dark" href="#solutions">
                Explore our solutions <ArrowUpRight size={18} />
              </a>
              <a className="text-link" href="#team">
                Meet the SWK team <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-proof">
              <div className="mini-portraits">
                {brand.team.slice(0, 3).map((p) => (
                  <img
                    key={p.name}
                    src={"/" + p.photo.replace("assets/images/", "assets/")}
                    alt=""
                  />
                ))}
              </div>
              <span>
                Digital thinking.
                <br />
                <strong>Real people behind it.</strong>
              </span>
              <span className="proof-divider" />
              <ShieldCheck size={23} />
              <span>
                Evidence-led.
                <br />
                <strong>Human-approved.</strong>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="skyline"
              src="/assets/dubai-skyline-hero.webp"
              alt="Dubai skyline from the SWK Properties architectural collection"
            />
            <div className="visual-top">
              <span className="pill">
                <span className="dot" /> THE GROWTH ENGINE
              </span>
              <span>01 / 05</span>
            </div>
            <div
              className="glass-composition"
              aria-label="Five connected capabilities"
            >
              <div className="glass-block b1">
                <span>01</span>
                <Layers />
                <strong>
                  Brand
                  <br />
                  visibility
                </strong>
              </div>
              <div className="glass-block b2">
                <span>02</span>
                <Globe />
                <strong>
                  Digital
                  <br />
                  experiences
                </strong>
              </div>
              <div className="glass-block b3">
                <span>03</span>
                <Target />
                <strong>
                  Property
                  <br />
                  marketing
                </strong>
              </div>
              <div className="glass-block b4">
                <span>04</span>
                <ChartNoAxesCombined />
                <strong>
                  Market
                  <br />
                  insights
                </strong>
              </div>
              <div className="glass-block b5">
                <Sparkles />
                <strong>Business growth</strong>
                <ArrowUpRight />
              </div>
            </div>
            <div className="visual-bottom">
              <span>DUBAI ROOTS. A WIDER PERSPECTIVE.</span>
              <span className="round-arrow">
                <ArrowUpRight size={20} />
              </span>
            </div>
          </div>
        </section>
        <div className="capability-strip">
          <span>A stronger foundation for what’s next.</span>
          {[
            "STRATEGY",
            "DIGITAL EXPERIENCES",
            "PROPERTY MARKETING",
            "GROWTH INTELLIGENCE",
          ].map((t) => (
            <strong key={t}>
              <span>✳</span> {t}
            </strong>
          ))}
        </div>
        <section className="section" id="solutions">
          <div className="section-heading">
            <div>
              <div className="eyebrow">01 / THE SWKGROWTH ADVANTAGE</div>
              <h2>
                More than marketing.
                <br />
                <span className="serif">Measurable direction.</span>
              </h2>
            </div>
            <p>
              A good-looking campaign is a beginning.
              <br />
              We connect the thinking, the experience, and the next step — so
              your business can move with purpose.
            </p>
          </div>
          <div className="solution-grid">
            {[
              [
                Layers,
                "Brand positioning",
                "Be recognised for the right reasons.",
                "A clear point of view. A consistent identity. A story that makes your value easier to understand.",
              ],
              [
                Globe,
                "Digital experiences",
                "Make every first impression count.",
                "Responsive websites and useful property journeys that help people find what matters.",
              ],
              [
                Target,
                "Property marketing",
                "Give every property its own story.",
                "Considered imagery, clear messaging, and campaign concepts built around the audience.",
              ],
              [
                ChartNoAxesCombined,
                "Growth intelligence",
                "Better questions. Better next steps.",
                "Evidence-led planning, labelled assumptions, and human review before consequential decisions.",
              ],
            ].map(([Icon, title, sub, desc], i) => {
              const I = Icon as typeof Layers;
              return (
                <article className="solution" key={String(title)}>
                  <div className="card-top">
                    <I size={29} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{String(title)}</h3>
                  <strong>{String(sub)}</strong>
                  <p>{String(desc)}</p>
                  <button
                    className="circle-link"
                    aria-label={"Discuss " + title}
                    onClick={contact}
                  >
                    <ArrowUpRight />
                  </button>
                </article>
              );
            })}
          </div>
          <div className="section-note">
            <ShieldCheck size={16} /> Clear expectations, always. No guaranteed
            leads, sales, or returns.
          </div>
        </section>
        <section className="partner-section section" id="partner">
          <div className="partner-image">
            <img
              src="/assets/dubai-cinema-home.webp"
              alt="Dubai architectural imagery sourced from SWK Properties"
              loading="lazy"
            />
            <span className="image-label">A DIFFERENT VIEW OF DUBAI</span>
          </div>
          <div className="partner-copy">
            <div className="eyebrow">02 / OUR FEATURED REAL ESTATE PARTNER</div>
            <img
              className="partner-logo"
              src="/brand/swk-properties.png"
              alt="SWK Properties official logo"
              loading="lazy"
            />
            <h2>
              Digital ambition.
              <br />
              <span className="serif">Local perspective.</span>
            </h2>
            <p>
              Meet SWK Properties. Explore their property portfolio and the
              people helping clients navigate the next step in Dubai real
              estate.
            </p>
            <p className="muted">
              SWKGrowth focuses on digital services and growth planning. SWK
              Properties provides real estate services. Two distinct
              experiences, connected by a thoughtful approach.
            </p>
            <a
              className="btn dark"
              href={brand.site.url}
              target="_blank"
              rel="noreferrer"
            >
              Explore SWK Properties <ArrowUpRight size={18} />
            </a>
            <a className="text-link" href="#team">
              Meet the people behind it <ArrowRight size={17} />
            </a>
          </div>
        </section>
        <section className="section" id="properties">
          <div className="section-heading">
            <div>
              <div className="eyebrow">03 / THE PROPERTY PERSPECTIVE</div>
              <h2>
                Distinctive spaces.
                <br />
                <span className="serif">Different possibilities.</span>
              </h2>
            </div>
            <div>
              <p>
                A curated look at the SWK Properties collection.
                <br />
                Source portfolio showcase; availability is not live.
              </p>
              <a
                className="text-link"
                href={brand.site.url + "/properties/"}
                target="_blank"
                rel="noreferrer"
              >
                Explore the collection <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="property-grid">
            {brand.properties.map((p, i) => (
              <article key={p.id} className="property">
                <a
                  href={brand.site.url + "/properties/" + p.id + "/"}
                  target="_blank"
                  rel="noreferrer"
                  className="property-image"
                >
                  <img
                    src={"/assets/" + p.id + ".webp"}
                    alt={p.title + " — source portfolio image"}
                    loading="lazy"
                  />
                  <span className="pill">PORTFOLIO SHOWCASE</span>
                  <span className="round-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </a>
                <div className="property-meta">
                  <span>
                    {p.community} · {p.emirate}
                  </span>
                  <span>0{i + 1}</span>
                </div>
                <h3>{p.title}</h3>
                <div className="property-meta">
                  <span>
                    {p.type} · {p.developer}
                  </span>
                  <a
                    href={
                      "mailto:" +
                      brand.site.email +
                      "?subject=" +
                      encodeURIComponent("Property enquiry: " + p.title)
                    }
                  >
                    Enquire <ArrowUpRight size={13} />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="source-note">
            Source: SWK Properties repository, retrieved 25 Oct 2026. Project
            names and locations reproduced from source records; independently
            unverified. Prices, yields, and availability are intentionally
            omitted.{" "}
            <a
              href="https://github.com/swkpropertiesuae/swkpropertiesuae.com/blob/main/data/properties.json"
              target="_blank"
              rel="noreferrer"
            >
              View source ↗
            </a>
          </p>
        </section>
        <section className="team-section section" id="team">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                04 / THE PEOPLE BEHIND THE PROPERTIES
              </div>
              <h2>
                Real people.
                <br />
                <span className="serif">A personal perspective.</span>
              </h2>
            </div>
            <p>
              Meet the SWK Properties team.
              <br />
              Different expertise. A shared commitment
              <br />
              to a clearer client experience.
            </p>
          </div>
          <div className="team-grid">
            {brand.team.map((p, i) => (
              <button
                className="team-card"
                key={p.name}
                onClick={() => setModal("team:" + i)}
              >
                <div className="team-photo">
                  <img
                    src={"/" + p.photo.replace("assets/images/", "assets/")}
                    alt={p.name}
                    loading="lazy"
                  />
                  <span className="round-arrow">
                    <Plus size={19} />
                  </span>
                </div>
                <h3>{p.name}</h3>
                <p>{p.role}</p>
              </button>
            ))}
          </div>
          <p className="source-note">
            Authentic portraits, names, titles and biographies from the SWK
            Properties team directory.{" "}
            <a
              href="https://github.com/swkpropertiesuae/swkpropertiesuae.com/blob/main/data/team.json"
              target="_blank"
              rel="noreferrer"
            >
              View source ↗
            </a>
          </p>
        </section>
        <section className="process-section section" id="approach">
          <div className="section-heading">
            <div>
              <div className="eyebrow">05 / HOW WE MOVE FORWARD</div>
              <h2>
                From digital presence
                <br />
                to <span className="serif">business momentum.</span>
              </h2>
            </div>
            <a href="#/app" className="btn outline">
              Explore the demo workspace <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="process-grid">
            {[
              [
                "Discover",
                "First, we listen. Your business, your audience, your next chapter.",
              ],
              [
                "Strategize",
                "A clear direction for your positioning, channels, and digital experience.",
              ],
              [
                "Build",
                "Bring the plan to life through purposeful design, content, and development.",
              ],
              [
                "Optimize",
                "Review the evidence. Learn what works. Make the next decision with context.",
              ],
            ].map(([n, d], i) => (
              <article key={n}>
                <div className="step-line">
                  <span>0{i + 1}</span>
                  <ArrowRight size={20} />
                </div>
                <h3>{n}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section" id="insights">
          <div className="section-heading">
            <div>
              <div className="eyebrow">06 / A LITTLE MORE PERSPECTIVE</div>
              <h2>
                Ideas that move
                <br />
                <span className="serif">real estate forward.</span>
              </h2>
            </div>
            <p>
              Practical thinking for a better digital presence.
              <br />
              Original editorial guidance, without invented market statistics.
            </p>
          </div>
          <div className="insight-grid">
            {insights.map((a, i) => (
              <button
                className="insight-card"
                key={a.title}
                onClick={() => setArticle(i)}
              >
                <div className={"insight-art art-" + i}>
                  {i === 0 ? <Globe /> : i === 1 ? <ShieldCheck /> : <Target />}
                  <span>
                    SWK<span>Perspective</span>
                  </span>
                  <ArrowUpRight />
                </div>
                <div className="eyebrow">{a.category}</div>
                <h3>{a.title}</h3>
                <span className="text-link">
                  Read perspective <ArrowUpRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="pricing section" id="pricing">
          <div className="section-heading">
            <div>
              <div className="eyebrow">07 / PLAN YOUR NEXT STEP</div>
              <h2>
                Clear scope.
                <br />
                <span className="serif">Transparent conversations.</span>
              </h2>
            </div>
            <div>
              <p>
                Proposed pricing from the supplied concept brief.
                <br />
                USD. Not currently available to purchase.
              </p>
              <div className="segmented">
                <button
                  className={!annual ? "selected" : ""}
                  onClick={() => setAnnual(false)}
                >
                  Monthly
                </button>
                <button
                  className={annual ? "selected" : ""}
                  onClick={() => setAnnual(true)}
                >
                  Annual billing
                </button>
              </div>
            </div>
          </div>
          <div className="price-grid">
            {[
              ["Owner", 299, 250],
              ["Manager", 249, 208],
              ["BDM", 149, 125],
              ["IT Admin", 99, 83],
              ["Agent", 199, 166],
            ].map(([n, m, y]) => (
              <article key={n} className="price-card">
                <span className="eyebrow">PROPOSED / PER USER</span>
                <h3>{n}</h3>
                <strong>
                  ${annual ? y : m}
                  <small>/month</small>
                </strong>
                <p>
                  {annual
                    ? "$" + Number(y) * 12 + " billed annually"
                    : "Monthly billing"}
                </p>
                <p>Proposed full platform access, modules and email support.</p>
                <button className="text-link" onClick={contact}>
                  Discuss this plan <ArrowUpRight size={15} />
                </button>
              </article>
            ))}
          </div>
          <details>
            <summary>
              Agency, enterprise, pilot, add-ons and partnership concepts{" "}
              <ChevronDown size={16} />
            </summary>
            <div className="extra-pricing">
              <p>
                <strong>Agency:</strong> $999/month, up to 10 users; $99/month
                per additional user.
              </p>
              <p>
                <strong>Enterprise:</strong> custom, indicative $2,999+/month
                plus $2,995 setup; 12-month minimum.
              </p>
              <p>
                <strong>Property pilot:</strong> $4,995 for 90 days.{" "}
                <strong>White-label:</strong> indicative $15,000+/year, 12-month
                minimum and legal review.
              </p>
              <p>
                <strong>API concept:</strong> $199/month for 10,000 calls;
                $0.02/additional call. Not connected in this demo.
              </p>
              <p>
                <strong>Research concept:</strong> $99/city/month,
                $499/region/month, or $1,999/year global. Research feeds are not
                connected.
              </p>
              <p>
                <strong>Consulting concept:</strong> $499/90 min; $1,999/half
                day; $3,999/audit; $1,999/month for 8 hours.
              </p>
              <p>
                <strong>Affiliate concept:</strong> 20% first-year commission,
                90-day attribution window. Agency and technology partnership
                concepts require an agreement. No program is live in this demo.
              </p>
              <p>
                All pricing is proposed, subject to scope and confirmation.
                Applicable tax must be confirmed in a written quote. No payments
                or subscriptions are processed here.
              </p>
            </div>
          </details>
        </section>
        <section className="cta section" id="contact">
          <img src="/assets/dubai-skyline-hero.webp" alt="" loading="lazy" />
          <div className="cta-inner">
            <div className="eyebrow">READY FOR YOUR NEXT CHAPTER?</div>
            <h2>
              A stronger presence.
              <br />
              <span className="serif">A clearer way forward.</span>
            </h2>
            <p>
              Let’s build a digital experience around where
              <br />
              your real estate business wants to go.
            </p>
            <button className="btn peach" onClick={contact}>
              Let’s grow together <ArrowUpRight size={19} />
            </button>
            <small>
              Consultation request · Results vary based on market conditions.
            </small>
          </div>
        </section>
      </main>
      <footer className="section">
        <div className="footer-top">
          <div>
            <Logo />
            <p>
              Smarter digital experiences.
              <br />
              Greater real estate growth.
            </p>
            <span className="eyebrow">DUBAI ROOTS. FORWARD THINKING.</span>
          </div>
          <div>
            <strong>Explore</strong>
            <a href="#solutions">Our solutions</a>
            <a href="#partner">SWK Properties</a>
            <a href="#team">Our team</a>
            <a href="#/app">Demo workspace</a>
          </div>
          <div>
            <strong>Let’s connect</strong>
            <span className="source-note">SWK Properties contact</span>
            <a href={"mailto:" + brand.site.email}>{brand.site.email}</a>
            <a href={"tel:" + brand.site.phone}>{brand.site.phoneDisplay}</a>
            <a
              href={"https://wa.me/" + brand.site.phone.replace("+", "")}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp <ArrowUpRight size={14} />
            </a>
          </div>
          <div>
            <strong>Follow SWK Properties</strong>
            <a href={brand.site.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <ArrowUpRight size={14} />
            </a>
            <a href={brand.site.instagram} target="_blank" rel="noreferrer">
              Instagram <ArrowUpRight size={14} />
            </a>
            <a href={brand.site.url} target="_blank" rel="noreferrer">
              Official website <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} SWKGrowth. A platform concept for
            thoughtful growth.
          </span>
          <div>
            <button onClick={() => setModal("Privacy & demo data")}>
              Privacy
            </button>
            <button onClick={() => setModal("Terms & limitations")}>
              Terms
            </button>
            <button onClick={() => setModal("Source & brand attribution")}>
              Sources
            </button>
          </div>
        </div>
      </footer>
      <button
        className="chat-toggle"
        aria-label="Open SWKGrowth guide"
        onClick={() => setChat(!chat)}
      >
        {chat ? <X size={23} /> : <Sparkles size={23} />}
      </button>
      {chat && (
        <aside className="chat-panel" aria-label="SWKGrowth guide">
          <div className="modal-head">
            <div>
              <strong>SWKGrowth guide</strong>
              <p className="source-note">
                Local scripted guide · Not live chat or AI
              </p>
            </div>
            <button
              className="icon-btn"
              aria-label="Close guide"
              onClick={() => setChat(false)}
            >
              <X size={18} />
            </button>
          </div>
          <p>
            Explore solutions, the workspace, or contact SWK Properties. What
            would you like to know?
          </p>
          <div className="chat-messages" aria-live="polite">
            {messages.map((s, i) => (
              <p key={i} className={i % 2 ? "reply" : "question"}>
                {s}
              </p>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!question.trim()) return;
              const reply = /contact|phone|whatsapp/i.test(question)
                ? "SWK Properties: " +
                  brand.site.phoneDisplay +
                  " · " +
                  brand.site.email
                : /price|cost|plan/i.test(question)
                  ? "Proposed pricing is available in Plan your next step. It is not a live subscription offer."
                  : "Explore our four solutions or open the demo workspace. This guide uses scripted responses and has no live market or AI connection.";
              setMessages([...messages, question, reply]);
              setQuestion("");
            }}
          >
            <label htmlFor="chat-input">Ask the local guide</label>
            <div className="search-row">
              <input
                id="chat-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about solutions…"
              />
              <button className="btn dark small" type="submit">
                Send
              </button>
            </div>
          </form>
          <a
            className="text-link"
            href={"https://wa.me/" + brand.site.phone.replace("+", "")}
            target="_blank"
            rel="noreferrer"
          >
            Talk to SWK Properties on WhatsApp <ArrowUpRight size={14} />
          </a>
        </aside>
      )}
      {article >= 0 && (
        <Modal title={insights[article].title} onClose={() => setArticle(-1)}>
          <span className="badge">Original editorial guidance</span>
          <p>{insights[article].body}</p>
          <p className="source-note">
            Not market research, financial advice, or a performance guarantee.
          </p>
          <button
            className="btn dark"
            onClick={() => {
              setArticle(-1);
              contact();
            }}
          >
            Discuss your brief <ArrowUpRight size={17} />
          </button>
        </Modal>
      )}
      {modal && (
        <Modal
          title={
            modal.startsWith("team:")
              ? brand.team[Number(modal.split(":")[1])].name
              : modal
          }
          onClose={() => setModal("")}
        >
          {modal.startsWith("team:") ? (
            (() => {
              const p = brand.team[Number(modal.split(":")[1])];
              return (
                <>
                  <img
                    className="bio-photo"
                    src={"/" + p.photo.replace("assets/images/", "assets/")}
                    alt={p.name}
                  />
                  <strong>{p.role}</strong>
                  <p>{p.bio}</p>
                  <a
                    className="btn dark"
                    href={
                      "mailto:" +
                      brand.site.email +
                      "?subject=" +
                      encodeURIComponent("Enquiry for " + p.name)
                    }
                  >
                    Contact via SWK Properties <ArrowUpRight size={17} />
                  </a>
                  <p className="source-note">
                    Biography reproduced from the official repository team
                    directory.
                  </p>
                </>
              );
            })()
          ) : modal.includes("chapter") ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPrepared(true);
              }}
            >
              <p>
                A few details are enough to start. This form prepares an email
                to SWK Properties; nothing is submitted to a server.
              </p>
              <label>
                Your name
                <input required name="name" autoComplete="name" />
              </label>
              <label>
                Work email
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                />
              </label>
              <label>
                What are you planning?
                <textarea required name="brief" rows={3} />
              </label>
              <label className="checkbox">
                <input type="checkbox" required /> I agree to share these
                details with SWK Properties through my email application.
              </label>
              <button
                className="btn dark"
                type="submit"
                onClick={(e) => {
                  const f = e.currentTarget.form;
                  if (f?.checkValidity()) {
                    const d = new FormData(f);
                    const body = `Name: ${d.get("name")}\nEmail: ${d.get("email")}\n\n${d.get("brief")}`;
                    setMailHref(
                      "mailto:" +
                        brand.site.email +
                        "?subject=SWKGrowth consultation request&body=" +
                        encodeURIComponent(body),
                    );
                  }
                }}
              >
                Prepare consultation email <ArrowRight size={17} />
              </button>
              <a
                className={
                  "btn peach prepared-email " + (!prepared ? "hidden" : "")
                }
                href={mailHref}
              >
                Open your email application <ArrowUpRight size={17} />
              </a>
              {prepared && (
                <p role="status">
                  Email prepared. Use the link above, review the message, and
                  send it in your email application. It has not been sent.
                </p>
              )}
            </form>
          ) : modal.includes("Privacy") ? (
            <>
              <p>
                The demo workspace stores synthetic records and preferences in
                this browser’s localStorage. There are no connected analytics,
                CRM, AI, payment or authentication services.
              </p>
              <p>
                The consultation form prepares an email only after explicit
                consent. Chat messages remain in memory. Do not enter sensitive
                or real client information into this demo.
              </p>
              <p>
                Export or erase local workspace records in Settings. Clearing
                browser data also removes them. Third-party links operate under
                their own policies.
              </p>
            </>
          ) : modal.includes("Terms") ? (
            <>
              <p>
                This is an interactive platform concept, not an authenticated
                production service. Prices are proposed, all workspace metrics
                are demo data, and role controls are demonstrations only.
              </p>
              <p>
                No leads, sales or returns are guaranteed. No compliance
                certifications, uptime SLA, historical launch claims or live
                integrations are asserted. ROI tools compute illustrative
                scenarios and never recommend an investment.
              </p>
              <p>
                Information is general guidance, not financial, tax or legal
                advice. Obtain a written scope and current terms before
                purchasing any service.
              </p>
            </>
          ) : (
            <>
              <p>
                Authentic partner logo, team portraits, biographies, property
                images and Dubai photography are copied from the user-designated
                SWK Properties repository without altering the partner logo.
              </p>
              <a
                className="text-link"
                href="https://github.com/swkpropertiesuae/swkpropertiesuae.com/tree/f50616a934e2902ad8ec592a2f1913e4fd6013e9"
                target="_blank"
                rel="noreferrer"
              >
                Source snapshot: 25 Oct 2026 <ArrowUpRight size={16} />
              </a>
              <p>
                SWKGrowth’s original wordmark and interface are distinct from
                SWK Properties. Property records are source-derived showcases,
                not independently verified inventory.
              </p>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const fn = () => {
      setHash(location.hash);
      if (location.hash.startsWith("#/")) window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return hash.startsWith("#/app") ? <Workspace /> : <Landing />;
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
