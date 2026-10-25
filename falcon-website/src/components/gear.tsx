import { useMemo } from "react";
import { cn } from "@/lib/utils";

/** Procedural SVG gear outline: used for the animated industrial backdrop. */
function gearPath(teeth: number, rOut: number, rRoot: number, rHole: number) {
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const q = [a - step * 0.28, a - step * 0.17, a + step * 0.17, a + step * 0.28];
    const rs = [rRoot, rOut, rOut, rRoot];
    q.forEach((ang, k) => pts.push(`${(Math.cos(ang) * rs[k]).toFixed(2)},${(Math.sin(ang) * rs[k]).toFixed(2)}`));
  }
  return `M${pts.join("L")}Z M${rHole},0 A${rHole},${rHole} 0 1 0 ${-rHole},0 A${rHole},${rHole} 0 1 0 ${rHole},0Z`;
}

export function Gear({ teeth = 14, className, spokes = true }: { teeth?: number; className?: string; spokes?: boolean }) {
  const d = useMemo(() => gearPath(teeth, 100, 84, 26), [teeth]);
  return (
    <svg viewBox="-104 -104 208 208" className={cn("fill-none stroke-current", className)} aria-hidden="true">
      <path d={d} fillRule="evenodd" strokeWidth="1.6" strokeLinejoin="round" />
      <circle r="62" strokeWidth="0.8" strokeDasharray="2 5" />
      {spokes && [0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1="30" y1="0" x2="60" y2="0" strokeWidth="0.8" transform={`rotate(${a})`} />)}
    </svg>
  );
}
