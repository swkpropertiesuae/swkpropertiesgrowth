import { ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Reveal } from "@/components/ui/reveal";
import { CtaBand, FaqList, Illustrated, PageHero, SectionHead } from "@/components/sections";
import { categories } from "@/lib/site";
import { openQuote } from "@/lib/quote";
import { cn } from "@/lib/utils";

export default function Products() {
  return (
    <Layout>
      <PageHero eyebrow="What We Supply" title="Five categories. One dependable source." crumb="Products" />

      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-28">
          {categories.map((c, i) => (
            <div key={c.id} id={c.id} className="grid scroll-mt-28 items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <Reveal className={cn("relative", i % 2 === 1 && "lg:order-2")}>
                <div className={cn("absolute -inset-3 -z-10 rounded-[2rem] border border-gold/25", i % 2 === 0 ? "translate-x-4 translate-y-4" : "-translate-x-4 translate-y-4")} aria-hidden />
                <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
                  {c.image
                    ? <img src={c.image} alt={c.title} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                    : <Illustrated Icon={c.icon} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060d1f]/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-6 font-display text-8xl leading-none font-bold text-white/20">{c.num}</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <Badge><c.icon className="size-3.5" /> Category {c.num}</Badge>
                <h2 className="mt-5 text-4xl leading-[1.1] font-bold text-balance sm:text-5xl">{c.title}</h2>
                <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">{c.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {c.tags.map((t) => <li key={t} className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-foreground/80">{t}</li>)}
                </ul>
                <div className="mt-9 flex flex-wrap gap-3">
                  <ShimmerButton onClick={() => openQuote(c.title)}>Request a quote <ArrowUpRight className="size-4 text-gold" /></ShimmerButton>
                  <Button variant="ghost" asChild><a href="/contact.html">Talk to sourcing</a></Button>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#050b1a] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHead align="center" eyebrow="Common Questions" title={<>Sourcing &amp; supply, <span className="text-gold-gradient">answered.</span></>} />
          <FaqList />
        </div>
      </section>

      <CtaBand />
    </Layout>
  );
}
