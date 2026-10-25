import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronRight, FileText, PackageSearch, Truck, Phone } from "lucide-react";
import { Badge } from "./ui/badge";
import { Reveal } from "./ui/reveal";
import { Counter } from "./ui/counter";
import { SpotlightCard } from "./ui/spotlight-card";
import { ShimmerButton } from "./ui/shimmer-button";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Backdrop } from "./backdrop";
import { Gear } from "./gear";
import { company, faqs, type Category } from "@/lib/site";
import { openQuote } from "@/lib/quote";
import { cn } from "@/lib/utils";

export function SectionHead({ eyebrow, title, desc, align = "split" }: { eyebrow: string; title: React.ReactNode; desc?: React.ReactNode; align?: "split" | "center" }) {
  return (
    <div className={cn("mb-14 flex flex-col gap-6", align === "split" ? "lg:flex-row lg:items-end lg:justify-between" : "items-center text-center")}>
      <Reveal>
        <Badge>{eyebrow}</Badge>
        <h2 className="mt-5 text-4xl leading-[1.08] font-bold text-balance sm:text-5xl lg:text-[3.4rem]">{title}</h2>
      </Reveal>
      {desc && <Reveal delay={0.1}><p className="max-w-md text-[17px] leading-relaxed text-muted-foreground">{desc}</p></Reveal>}
    </div>
  );
}

export function PageHero({ eyebrow, title, crumb }: { eyebrow: string; title: string; crumb: string }) {
  return (
    <section className="relative -mt-28 overflow-hidden pt-44 pb-20 sm:pt-52 sm:pb-28">
      <Backdrop variant="page" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.nav aria-label="Breadcrumb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <a href="/" className="transition hover:text-gold-soft">Home</a><ChevronRight className="size-3.5" /><span className="text-foreground/80">{crumb}</span>
        </motion.nav>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <Badge>{eyebrow}</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.04] font-bold text-balance sm:text-6xl lg:text-7xl">{title}</h1>
        </motion.div>
      </div>
      <div className="hairline-gold absolute inset-x-0 bottom-0 opacity-60" />
    </section>
  );
}

/** Illustrated tile for categories without a photo (Automation): blueprint grid, gear and live signal trace. */
export function Illustrated({ Icon }: { Icon: Category["icon"] }) {
  return (
    <div className="relative size-full overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#1a3f86_0%,#0a1733_60%,#070f24_100%)]">
      <div className="bg-grid absolute inset-0 opacity-80" />
      <Gear teeth={12} className="absolute -right-10 -bottom-12 size-56 animate-spin-slow text-gold/30" />
      <svg viewBox="0 0 300 120" className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 text-gold/80" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <motion.path
          d="M0 70 L40 70 L55 30 L75 100 L95 55 L115 70 L170 70 L185 20 L205 105 L225 62 L245 70 L300 70"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.2, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute top-5 left-5 grid size-14 place-items-center rounded-2xl border border-gold/40 bg-gold/10 text-gold backdrop-blur"><Icon className="size-7" /></div>
    </div>
  );
}

export function CategoryCard({ c, className, index = 0, tall = false }: { c: Category; className?: string; index?: number; tall?: boolean }) {
  return (
    <Reveal delay={index * 0.07} className={cn("h-full", className)}>
      <article id={undefined} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_30px_80px_-30px_rgba(217,174,76,0.35)]">
        <div className={cn("relative overflow-hidden", tall ? "aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:min-h-80 lg:flex-1" : "aspect-[16/10]")}>
          {c.image ? (
            <img src={c.image} alt={c.title} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]" />
          ) : <Illustrated Icon={c.icon} />}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
          <span className="absolute top-4 right-4 font-display text-5xl leading-none font-bold text-white/15 transition group-hover:text-gold/50">{c.num}</span>
          {c.image && <div className="absolute top-4 left-4 grid size-11 place-items-center rounded-xl border border-white/20 bg-[#071026]/70 text-gold backdrop-blur"><c.icon className="size-5" /></div>}
        </div>
        <div className="flex flex-col gap-3 p-6 pt-4">
          <h3 className="text-2xl leading-snug font-bold">{c.title}</h3>
          <p className="line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{c.body}</p>
          <button onClick={() => openQuote(c.title)} className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-bold text-gold transition-all hover:gap-3 hover:text-gold-soft">
            Request a quote <ArrowRight className="size-4" />
          </button>
        </div>
      </article>
    </Reveal>
  );
}

export function WhyGrid({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((w, i) => (
        <Reveal key={w.title} delay={i * 0.08} className="h-full">
          <SpotlightCard className="h-full p-7">
            <span className="font-display text-6xl leading-none font-bold text-gold-gradient">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-6 text-xl font-bold">{w.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{w.body}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}

const steps = [
  { Icon: FileText, title: "Share the specification", body: "Tell us the make, model, quantity and timeline through the quote form or by phone." },
  { Icon: PackageSearch, title: "We source & quote", body: "Our sourcing team returns pricing and lead time within one business day." },
  { Icon: Truck, title: "Delivered across the UAE", body: "Supply to Ajman, Dubai, Sharjah and the Northern Emirates, built around dependable delivery." },
];

export function Process() {
  return (
    <div className="relative grid gap-6 md:grid-cols-3">
      <div className="absolute top-[3.1rem] right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent md:block" />
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.12}>
          <div className="relative flex flex-col items-center text-center">
            <div className="relative z-10 grid size-[6.2rem] place-items-center rounded-full border border-gold/30 bg-gradient-to-b from-[#12275a] to-[#0a1633] shadow-[0_0_50px_-10px_rgba(217,174,76,0.45)]">
              <s.Icon className="size-9 text-gold" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 grid size-8 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">{i + 1}</span>
            </div>
            <h3 className="mt-6 text-2xl font-bold">{s.title}</h3>
            <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function FaqList() {
  return (
    <Reveal>
      <Accordion type="single" collapsible defaultValue="faq-0" className="mx-auto grid max-w-3xl gap-3">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`faq-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Reveal>
  );
}

export function StatBand() {
  const stats = [
    { node: <span>UAE-Wide</span>, label: "Delivery Coverage" },
    { node: <Counter to={5} />, label: "Core Product Lines" },
    { node: <span>Ajman</span>, label: "Headquarters" },
    { node: <span>HSE</span>, label: "Compliant Supply" },
  ];
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-gradient-to-r from-[#0a1b44] via-[#0e2759] to-[#0a1b44]">
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="px-4 text-center lg:border-r lg:border-white/10 lg:last:border-r-0">
            <div className="font-display text-4xl font-bold text-gold-gradient sm:text-5xl">{s.node}</div>
            <div className="mt-2 text-xs font-semibold tracking-[0.18em] text-foreground/70 uppercase">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CtaBand({ title = "Need a formal quotation?", body = "Tell us the specification and quantity — we'll come back with pricing and lead time." }: { title?: string; body?: string }) {
  return (
    <section className="relative px-6 py-24">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-gold/25 bg-gradient-to-br from-[#10275c] via-[#0a1a40] to-[#070f26] px-8 py-16 text-center sm:px-16 sm:py-20">
        <Gear teeth={18} className="absolute -top-28 -right-24 size-[26rem] animate-spin-slow text-gold/[0.14]" />
        <Gear teeth={12} className="absolute -bottom-24 -left-16 size-72 animate-spin-slow-rev text-silver/[0.09]" spokes={false} />
        <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl leading-tight font-bold text-balance sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-foreground/75">{body}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ShimmerButton onClick={() => openQuote()} className="h-13 px-9 text-base">Request a Quote <ArrowUpRight className="size-4 text-gold" /></ShimmerButton>
            <Button asChild variant="outline" size="lg"><a href={company.phoneHref}><Phone /> {company.phone}</a></Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
