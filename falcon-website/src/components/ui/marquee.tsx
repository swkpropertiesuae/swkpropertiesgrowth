import { cn } from "@/lib/utils";

/** Infinite marquee (21st.dev marquee pattern): duplicated track, CSS-driven, pauses on hover. */
export function Marquee({
  children, className, reverse = false, duration = "45s",
}: { children: React.ReactNode; className?: string; reverse?: boolean; duration?: string }) {
  return (
    <div
      className={cn("group flex overflow-hidden [--gap:0.75rem] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]", className)}
      style={{ ["--duration" as string]: duration }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn("flex min-w-full shrink-0 animate-marquee items-center gap-[var(--gap)] pr-[var(--gap)] group-hover:[animation-play-state:paused]", reverse && "[animation-direction:reverse]")}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
