import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Menu, Phone } from "lucide-react";
import { Logo } from "./logo";
import { ShimmerButton } from "./ui/shimmer-button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { company, nav } from "@/lib/site";
import { openQuote } from "@/lib/quote";
import { cn } from "@/lib/utils";

const isActive = (href: string) => {
  const p = window.location.pathname.replace(/\/index\.html$/, "/");
  return href === "/" ? p === "/" : p === href || p === href.replace(".html", "");
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <header className={cn("sticky top-0 z-50 transition-all duration-500", scrolled ? "py-2" : "py-4")}>
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border px-4 transition-all duration-500 sm:px-6 lg:mx-auto",
          "mx-3 sm:mx-6",
          scrolled ? "h-[4.25rem] border-white/12 bg-[#071026]/80 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl" : "h-20 border-transparent bg-transparent",
        )}
      >
        <a href="/" aria-label="Falcon Equipment Trading — home" className="shrink-0">
          <Logo priority className={cn("transition-all duration-500", scrolled ? "h-11 sm:h-12" : "h-12 sm:h-14")} />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => {
              const active = isActive(n.href);
              return (
                <li key={n.href}>
                  <a
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      active ? "text-gold-soft" : "text-foreground/75 hover:text-foreground",
                    )}
                  >
                    {n.label}
                    <span className={cn("absolute inset-x-4 -bottom-0.5 h-px origin-left bg-gradient-to-r from-gold to-transparent transition-transform duration-300", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a href={company.phoneHref} className="hidden items-center gap-2 text-sm font-semibold text-foreground/80 transition hover:text-gold-soft xl:flex">
            <span className="grid size-8 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold"><Phone className="size-3.5" /></span>
            {company.phone}
          </a>
          <ShimmerButton onClick={() => openQuote()} className="hidden py-2.5 sm:inline-flex">
            Get a Quote <ArrowUpRight className="size-4 text-gold" />
          </ShimmerButton>
          <button
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.04] transition hover:border-gold/60 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </motion.div>

      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogContent side="right">
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <DialogDescription className="sr-only">Site navigation</DialogDescription>
          <Logo className="mt-1 mb-8 h-12" />
          <ul className="flex flex-col gap-1">
            {nav.map((n, i) => (
              <motion.li key={n.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i + 0.1 }}>
                <DialogClose asChild>
                  <a href={n.href} className={cn("flex items-center justify-between rounded-xl px-4 py-4 font-display text-2xl transition hover:bg-white/[0.06]", isActive(n.href) && "text-gold-soft")}>
                    {n.label} <ArrowUpRight className="size-5 text-gold" />
                  </a>
                </DialogClose>
              </motion.li>
            ))}
          </ul>
          <div className="mt-auto space-y-3 pt-8">
            <DialogClose asChild>
              <ShimmerButton onClick={() => openQuote()} className="w-full">Get a Quote</ShimmerButton>
            </DialogClose>
            <a href={company.phoneHref} className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-muted-foreground"><Phone className="size-4 text-gold" />{company.phone}</a>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
