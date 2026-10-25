import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { categories, company, nav } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#040a18]">
      <div className="hairline-gold absolute inset-x-0 top-0" />
      <div className="absolute -bottom-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-royal/15 blur-[140px]" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.3fr]">
        <div>
          <Logo className="h-20 sm:h-24" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Your trusted partner in industrial equipment trading across the United Arab Emirates.
          </p>
        </div>
        <div>
          <h4 className="mb-5 font-sans text-xs font-bold tracking-[0.2em] text-gold uppercase">Company</h4>
          <ul className="space-y-3 text-sm">
            {nav.map((n) => (<li key={n.href}><a className="text-foreground/75 transition hover:text-gold-soft" href={n.href}>{n.label}</a></li>))}
          </ul>
        </div>
        <div>
          <h4 className="mb-5 font-sans text-xs font-bold tracking-[0.2em] text-gold uppercase">Products</h4>
          <ul className="space-y-3 text-sm">
            {categories.map((c) => (<li key={c.id}><a className="text-foreground/75 transition hover:text-gold-soft" href={`/products.html#${c.id}`}>{c.short}</a></li>))}
          </ul>
        </div>
        <div>
          <h4 className="mb-5 font-sans text-xs font-bold tracking-[0.2em] text-gold uppercase">Contact</h4>
          <ul className="space-y-4 text-sm text-foreground/75">
            <li className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-gold" /><a className="hover:text-gold-soft" href={company.phoneHref}>{company.phone}</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-gold" /><a className="break-all hover:text-gold-soft" href={`mailto:${company.email}`}>{company.email}</a></li>
            <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" /><a className="hover:text-gold-soft" href="/contact.html">Amber Gem Tower, Ajman, UAE</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>&copy; {new Date().getFullYear()} {company.name}. All rights reserved.</span>
          <span>Industrial Machinery &amp; Equipment · Ajman, UAE</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-2 font-semibold text-foreground/70 transition hover:text-gold-soft">
            Back to top <ArrowUp className="size-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
