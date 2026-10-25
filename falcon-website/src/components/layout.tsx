import { MotionConfig, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Toaster } from "./ui/sonner";
import { AnnounceBar } from "./announce-bar";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { QuoteDialog } from "./quote-dialog";
import { CookieNotice } from "./cookie-notice";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-soft" />;
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const f = () => setShow(window.scrollY > 700); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return (
    <motion.button
      aria-label="Back to top" initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 16, pointerEvents: show ? "auto" : "none" }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="glass fixed right-4 bottom-4 z-[60] grid size-12 place-items-center rounded-full bg-[#071026]/80 text-gold shadow-xl transition hover:border-gold/60"
    >
      <ArrowUp className="size-5" />
    </motion.button>
  );
}

/** Shared page shell: announcement, floating nav, content, footer + global overlays. */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:font-semibold focus:text-primary-foreground">
        Skip to content
      </a>
      <ScrollProgress />
      <AnnounceBar />
      <Navbar />
      <main id="main" className="relative">{children}</main>
      <Footer />
      <QuoteDialog />
      <CookieNotice />
      <BackToTop />
      <Toaster />
    </MotionConfig>
  );
}
