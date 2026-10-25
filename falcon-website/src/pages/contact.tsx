import { useState } from "react";
import { ExternalLink, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { PageHero } from "@/components/sections";
import { company } from "@/lib/site";
import { hasEndpoint, submitInquiry } from "@/lib/quote";

const mapQ = encodeURIComponent(company.mapQuery);

function ContactForm() {
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("website")) return;
    setBusy(true);
    try {
      const mode = await submitInquiry({ kind: "contact", name: String(f.get("name")), email: String(f.get("email")), subject: String(f.get("subject") || ""), message: String(f.get("message")) });
      form.reset();
      toast.success(mode === "sent" ? "Message sent" : "Your email app is opening", { description: mode === "sent" ? "Thanks for reaching out — we typically reply within one business day." : "Press send in your email app to deliver the message." });
    } catch {
      toast.error("Couldn't send the message", { description: "Please email info@falconequipmenttrading.com or call +971 4 370 6130." });
    } finally { setBusy(false); }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2"><Label htmlFor="c-name">Full name</Label><Input id="c-name" name="name" required placeholder="Your name" autoComplete="name" /></div>
        <div className="grid gap-2"><Label htmlFor="c-email">Email</Label><Input id="c-email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" /></div>
      </div>
      <div className="grid gap-2"><Label htmlFor="c-subject">Subject</Label><Input id="c-subject" name="subject" placeholder="How can we help?" /></div>
      <div className="grid gap-2"><Label htmlFor="c-msg">Message</Label><Textarea id="c-msg" name="message" required placeholder="Tell us what you need…" className="min-h-40" /></div>
      <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-fit">{busy ? <Loader2 className="animate-spin" /> : <Send />} Send Message</Button>
      <p className="text-xs text-muted-foreground">{hasEndpoint ? "We typically reply within one business day." : "This opens a pre-filled email to our team. We typically reply within one business day."}</p>
    </form>
  );
}

export default function Contact() {
  const cards = [
    { Icon: Phone, t: "Phone", body: <a className="hover:text-gold-soft" href={company.phoneHref}>{company.phone}</a> },
    { Icon: Mail, t: "Email", body: <><a className="break-all hover:text-gold-soft" href={`mailto:${company.email}`}>{company.email}</a><br /><a className="break-all hover:text-gold-soft" href={`mailto:${company.hrEmail}`}>{company.hrEmail}</a></> },
    { Icon: MapPin, t: "Address", body: <>{company.addressLines.map((l, i) => <span key={l}>{l}{i < company.addressLines.length - 1 && <br />}</span>)}</> },
  ];
  return (
    <Layout>
      <PageHero eyebrow="Get In Touch" title="Let's talk about your next project." crumb="Contact" />

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid content-start gap-5">
            {cards.map((c, i) => (
              <Reveal key={c.t} delay={i * 0.08}>
                <SpotlightCard className="flex gap-5 p-6">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold"><c.Icon className="size-6" /></span>
                  <div><h3 className="font-sans text-xs font-bold tracking-[0.2em] text-gold uppercase">{c.t}</h3><p className="mt-2 text-[16px] leading-relaxed text-foreground/85">{c.body}</p></div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-white/10 bg-card p-7 shadow-2xl sm:p-10">
              <Badge>Send a Message</Badge>
              <h2 className="mt-4 mb-8 text-3xl font-bold">We reply within one business day.</h2>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-28">
        <Reveal className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-card shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-6">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-gold/15 text-gold"><MapPin className="size-5" /></span><div><p className="font-bold">Falcon HQ · Ajman</p><p className="text-sm text-muted-foreground">Amber Gem Tower, Sheikh Khalifa Street</p></div></div>
            <Button asChild variant="outline" size="sm"><a href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`} target="_blank" rel="noreferrer noopener">Open in Maps <ExternalLink /></a></Button>
          </div>
          <iframe title="Map showing Falcon Equipment Trading, Ajman" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[26rem] w-full [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.8)_brightness(0.95)]" src={`https://maps.google.com/maps?q=${mapQ}&z=15&output=embed`} />
        </Reveal>
      </section>
    </Layout>
  );
}
