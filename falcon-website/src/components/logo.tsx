import { cn } from "@/lib/utils";

/** Falcon lockup. `reversed` (default) is built for the dark site; HD 4x assets, vector lettering. */
export function Logo({ className, reversed = true, priority = false }: { className?: string; reversed?: boolean; priority?: boolean }) {
  const base = `/brand/logo-${reversed ? "reversed" : "color"}`;
  return (
    <picture>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.png`}
        alt="Falcon Equipment Trading FZE LLC"
        width={2445}
        height={812}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn("h-auto w-auto select-none drop-shadow-[0_2px_18px_rgba(8,18,50,0.55)]", className)}
        draggable={false}
      />
    </picture>
  );
}

export function Emblem({ className }: { className?: string }) {
  return (
    <picture>
      <source srcSet="/brand/emblem.webp" type="image/webp" />
      <img src="/brand/emblem.png" alt="" width={810} height={808} aria-hidden="true" decoding="async" className={cn("select-none", className)} draggable={false} />
    </picture>
  );
}
