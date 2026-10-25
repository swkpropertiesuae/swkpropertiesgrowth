import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Count-up number that starts when scrolled into view. */
export function Counter({ to, suffix = "", prefix = "", duration = 1.8 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { node.textContent = `${prefix}${Math.round(v)}${suffix}`; },
    });
    return () => controls.stop();
  }, [inView, to, suffix, prefix, duration]);
  return <span ref={ref}>{`${prefix}${to}${suffix}`}</span>;
}
