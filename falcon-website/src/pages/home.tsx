import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight, MapPin, ShieldCheck, Truck } from "lucide-react";
import { Layout } from "@/components/layout";
import { Backdrop } from "@/components/backdrop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { Counter } from "@/components/ui/counter";
import { CategoryCard, CtaBand, Process, SectionHead, StatBand, WhyGrid } from "@/components/sections";
import { categories, marqueeTerms, testimonials, whyUs } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

function Words({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: delay + i * 0.07, ease }}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function HeroArt() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 }), sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-7, 7]), rotX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const tx = useTransform(sx, [-0.5, 0.5], [-14, 14]), ty = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.3, ease }}
      onPointerMove={(e) => { if (reduce) return; const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
      className="relative mx-auto w-full max-w-lg [perspective:1200px] lg:max-w-none"
    >
      <motion.div style={{ rotateY: rotY, rotateX: rotX, transformStyle: "preserve-3d" }} className="relative">
        <div className="absolute -inset-4 rounded-[2.2rem] bg-gradient-to-br from-gold/40 via-transparent to-royal/40 opacity-70 blur-2xl" aria-hidden />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-card shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
          <motion.img style={{ x: tx, y: ty, scale: 1.12 }} src="/img/hero.webp" width={1300} height={1207} alt="Heavy industrial equipment: excavator, forklift and scissor lift on site" fetchPriority="high" className="aspect-[1/1.02] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/90 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-[11px] font-bold tracking-[0.2em] text-gold uppercase">Plant &amp; Process Equipment</p>
            <p className="mt-1 font-display text-xl font-bold sm:text-2xl">Built for the UAE's heaviest operations</p>
          </div>
        </div>
        {/* gold corner brackets */}
        {["-top-3 -left-3 border-t-2 border-l-2 rounded-tl-3xl", "-right-3 -bottom-3 border-r-2 border-b-2 rounded-br-3xl"].map((c) => (
          <span key={c} aria-hidden className={`absolute size-14 border-gold ${c}`} />
        ))}
        <motion.div style={{ translateZ: 60 }} animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 -right-4 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#071026]/90 backdrop-blur-xl py-3 pr-5 pl-3 shadow-2xl sm:flex">
          <span className="grid size-10 place-items-center rounded-xl bg-gold/15 text-gold"><Truck className="size-5" /></span>
          <span className="text-left"><span className="block text-sm font-bold">UAE-wide delivery</span><span className="block text-xs text-muted-foreground">Ajman · Dubai · Sharjah</span></span>
        </motion.div>
        <motion.div style={{ translateZ: 50 }} animate={reduce ? undefined : { y: [0, 9, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-24 -left-6 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#071026]/90 backdrop-blur-xl py-3 pr-5 pl-3 shadow-2xl sm:flex">
          <span className="grid size-10 place-items-center rounded-xl bg-royal/30 text-silver"><ShieldCheck className="size-5" /></span>
          <span className="text-left"><span className="block text-sm font-bold">HSE-compliant supply</span><span className="block text-xs text-muted-foreground">Quality you can trust</span></span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative -mt-28 overflow-hidden pt-40 pb-24 sm:pt-48 lg:pb-32">
      <Backdrop />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge className="pr-4"><MapPin className="size-3.5" /> Ajman, United Arab Emirates</Badge>
          </motion.div>
          <h1 className="mt-7 text-[clamp(2.5rem,5.2vw,4.5rem)] leading-[1.04] font-bold">
            <Words text="Industrial equipment, sourced right." delay={0.15} />
            <br />
            <Words text="Supplied fast." className="text-gold-gradient" delay={0.6} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9, ease }} className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/75">
            Falcon Equipment Trading is your trusted partner in industrial equipment trading — we source, supply and distribute machinery, tools and spares to businesses across the UAE, keeping operations running smoother, faster and more efficiently.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.05, ease }} className="mt-10 flex flex-wrap gap-4">
            <ShimmerButton asChild className="h-13 px-8 text-base"><a href="/products.html">Explore Our Products <ArrowRight className="size-4 text-gold" /></a></ShimmerButton>
            <Button asChild variant="outline" size="lg"><a href="/about.html">Our Story</a></Button>
          </motion.div>
          <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.3 }} className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { v: <><Counter to={5} suffix="+" /></>, l: "Product Categories" },
              { v: <>UAE</>, l: "Nationwide Supply" },
              { v: <><Counter to={24} />/7</>, l: "Reliable Sourcing" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-display text-4xl font-bold text-gold-gradient sm:text-5xl">{s.v}</dd>
                <dd className="mt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{s.l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
        <HeroArt />
      </div>
    </section>
  );
}


export default function Home() {
  return (
    <Layout>
      <Hero />

      <section aria-label="What we supply" className="relative border-y border-white/10 bg-[#050b1a] py-6">
        <Marquee duration="60s">
          {marqueeTerms.map((t) => (
            <span key={t} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-foreground/80">
              <span className="size-1.5 rounded-full bg-gold" />{t}
            </span>
          ))}
        </Marquee>
      </section>

      <section id="why" className="relative px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow="Why Choose Us" title={<>Four reasons operators trust <span className="text-gold-gradient">Falcon.</span></>} desc="Every engagement is built around quality, expertise and speed — the three things industrial operations can't run without." />
          <WhyGrid items={whyUs} />
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-transparent via-[#081330]/70 to-transparent px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow="What We Supply" title={<>Five categories.<br />One dependable source.</>} desc={<>From rotating equipment to safety gear, we stock and source what keeps UAE industry running. <a href="/products.html" className="font-bold text-gold underline-offset-4 hover:underline">See full catalogue →</a></>} />
          <div className="grid gap-6 lg:grid-cols-3">
            <CategoryCard c={categories[0]} index={0} className="lg:col-span-2" tall />
            <CategoryCard c={categories[1]} index={1} />
            <CategoryCard c={categories[2]} index={2} />
            <CategoryCard c={categories[3]} index={3} />
            <CategoryCard c={categories[4]} index={4} />
          </div>
        </div>
      </section>

      <StatBand />

      <section className="relative px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHead align="center" eyebrow="How It Works" title={<>From specification to <span className="text-gold-gradient">site</span>.</>} desc="A straightforward sourcing flow built around your timeline." />
          <Process />
        </div>
      </section>

      <section className="relative bg-[#050b1a] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow="Client Confidence" title={<>Operators run on<br />what we deliver.</>} desc="A sourcing partner is only as good as its last delivery — here's what that looks like in practice." />
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.role} delay={i * 0.1} className="h-full">
                <SpotlightCard className="flex h-full flex-col p-8">
                  <span className="font-display text-7xl leading-none text-gold/60" aria-hidden>“</span>
                  <blockquote className="-mt-4 flex-1 text-lg leading-relaxed text-foreground/90">{t.quote}</blockquote>
                  <footer className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5">
                    <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep font-display text-lg font-bold text-primary-foreground">{t.role[0]}</span>
                    <span><span className="block text-sm font-bold">{t.role}</span><span className="block text-xs text-muted-foreground">{t.org}</span></span>
                  </footer>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="about-teaser" className="relative px-6 py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="absolute -inset-3 -z-10 translate-x-4 translate-y-4 rounded-[2rem] border border-gold/30" aria-hidden />
            <img src="/img/warehouse.webp" alt="Industrial warehouse stocked with equipment and spares" width={700} height={616} loading="lazy" className="w-full rounded-[2rem] border border-white/10 object-cover shadow-2xl" />
            <div className="glass absolute -right-3 -bottom-6 rounded-2xl bg-[#071026]/80 px-6 py-4 shadow-2xl sm:-right-6">
              <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Headquarters</p>
              <p className="font-display text-xl font-bold">Ajman, UAE</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Badge>About Falcon</Badge>
            <h2 className="mt-5 text-4xl leading-[1.1] font-bold sm:text-5xl">A journey that started with <span className="text-gold-gradient">one bold move.</span></h2>
            <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">Falcon Equipment Trading FZE LLC was established by Mr. Ajay Kodaparthi, an Indian entrepreneur who began his journey in the United Arab Emirates in his early twenties, seeking opportunities beyond the limits of his homeland.</p>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">Read the full story, our mission and our vision on the About page.</p>
            <Button asChild variant="outline" size="lg" className="mt-8"><a href="/about.html">About Us <ArrowUpRight /></a></Button>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </Layout>
  );
}
