import { Eye, Flag, Target } from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { CtaBand, PageHero, SectionHead, WhyGrid } from "@/components/sections";
import { whyUs } from "@/lib/site";

const timeline = [
  "Founded in Ajman, UAE, with a focus on reliable industrial sourcing.",
  "Expanded into five core product lines serving oil & gas, manufacturing and utilities.",
  "Built a UAE-wide delivery network built on speed and dependability.",
];

export default function About() {
  return (
    <Layout>
      <PageHero eyebrow="About Us" title="Built on grit. Run on trust." crumb="About" />

      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="relative">
            <div className="absolute -inset-3 -z-10 -translate-x-4 translate-y-4 rounded-[2rem] border border-gold/30" aria-hidden />
            <img src="/img/hero.webp" alt="Falcon Equipment Trading heavy equipment yard" width={1300} height={1207} className="w-full rounded-[2rem] border border-white/10 object-cover shadow-2xl" />
          </Reveal>
          <Reveal delay={0.1}>
            <Badge>Our Story</Badge>
            <h2 className="mt-5 text-4xl leading-[1.1] font-bold sm:text-5xl">A journey that started with <span className="text-gold-gradient">one bold move.</span></h2>
            <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">Falcon Equipment Trading FZE LLC was established by Mr. Ajay Kodaparthi, an Indian entrepreneur who began his journey in the United Arab Emirates in his early twenties to seek business opportunities beyond the limits of his homeland, India.</p>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">With an entrepreneurial spirit to shape his own path without the support of family, he faced numerous challenges and setbacks along the way — and built Falcon into the dependable sourcing partner it is today.</p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          {[
            { Icon: Target, t: "Mission", b: "To be a dynamic, growth-oriented organization inspiring our team to be ambassadors of quality and service excellence — guided by strong corporate governance, accountability, innovation and transparency." },
            { Icon: Eye, t: "Vision", b: "To build a sustainable business through partnerships with reputable organizations, shaping a bright future with customer-centric and honourable policies across the entire value chain." },
          ].map((m, i) => (
            <Reveal key={m.t} delay={i * 0.1} className="h-full">
              <SpotlightCard className="h-full p-9">
                <span className="grid size-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold"><m.Icon className="size-7" /></span>
                <h3 className="mt-6 text-3xl font-bold">{m.t}</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{m.b}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#050b1a] px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHead align="center" eyebrow="Our Path" title={<>Three steps, <span className="text-gold-gradient">one direction.</span></>} />
          <ol className="relative ml-4 space-y-10 border-l border-gold/25 pl-10 sm:ml-0 sm:pl-14">
            <motion.span aria-hidden className="absolute top-0 -left-px h-full w-px origin-top bg-gradient-to-b from-gold via-gold to-transparent" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: "easeOut" }} />
            {timeline.map((t, i) => (
              <Reveal key={t} delay={i * 0.12}>
                <li className="relative">
                  <span className="absolute top-1 -left-[3.35rem] grid size-9 place-items-center rounded-full border border-gold/50 bg-background text-gold sm:-left-[4.1rem]"><Flag className="size-4" /></span>
                  <p className="text-xs font-bold tracking-[0.2em] text-gold uppercase">Step {String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-2 font-display text-2xl leading-snug font-bold sm:text-3xl">{t}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow="Why Choose Us" title={<>Four reasons operators trust <span className="text-gold-gradient">Falcon.</span></>} desc="Every engagement is built around quality, expertise and speed." />
          <WhyGrid items={whyUs} />
        </div>
      </section>

      <CtaBand title="Let's source what your operation needs." />
    </Layout>
  );
}
