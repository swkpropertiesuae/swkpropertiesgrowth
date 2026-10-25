import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { Button } from "./ui/button";

const KEY = "falcon-consent";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) { const t = setTimeout(() => setShow(true), 1400); return () => clearTimeout(t); } } catch { /* storage unavailable */ }
  }, []);
  const choose = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* noop */ } setShow(false); };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="dialog" aria-label="Cookie notice"
          className="glass fixed bottom-4 left-4 z-[60] flex w-[calc(100%-2rem)] max-w-md items-start gap-4 rounded-2xl bg-[#071026]/85 p-5 shadow-2xl"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Cookie className="size-5" /></span>
          <div>
            <p className="text-sm leading-relaxed text-foreground/85">We only use essential cookies and local storage to remember your preferences. No tracking, no ads.</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => choose("accepted")}>Accept</Button>
              <Button size="sm" variant="ghost" onClick={() => choose("declined")}>Decline</Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
