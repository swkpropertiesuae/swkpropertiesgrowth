import { useState } from "react";
import { X } from "lucide-react";

const KEY = "falcon-announce";

export function AnnounceBar() {
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } });
  if (hidden) return null;
  return (
    <div className="relative z-[55] bg-gradient-to-r from-[#0b1e48] via-[#12306b] to-[#0b1e48] text-[13px]">
      <div className="hairline-gold absolute inset-x-0 bottom-0" />
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2.5 text-center text-foreground/90">
        <span className="relative flex size-2 shrink-0"><span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-gold" /><span className="relative inline-flex size-2 rounded-full bg-gold" /></span>
        <span><b className="font-bold text-gold-soft">New:</b> Expanded UAE-wide delivery now live across Ajman, Dubai &amp; Sharjah.</span>
        <button aria-label="Dismiss announcement" onClick={() => { try { sessionStorage.setItem(KEY, "1"); } catch { /* noop */ } setHidden(true); }} className="absolute right-3 grid size-7 place-items-center rounded-full text-foreground/70 transition hover:bg-white/10 hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
