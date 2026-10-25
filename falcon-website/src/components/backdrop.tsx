import { Gear } from "./gear";

/** Animated brand backdrop: blueprint grid, slow gear train and soft gold/royal glows. */
export function Backdrop({ variant = "hero" }: { variant?: "hero" | "page" }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_70%_-10%,#143063_0%,#0a1630_45%,#060d1f_75%)]" />
      <div className="bg-grid absolute inset-0" />
      <div className="absolute -top-40 -left-40 size-[34rem] rounded-full bg-royal/25 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 size-[30rem] rounded-full bg-gold/15 blur-[130px]" />
      <Gear teeth={16} className="absolute -top-24 -right-24 size-[34rem] animate-spin-slow text-gold/[0.16] max-md:size-[22rem]" />
      <Gear teeth={11} className="absolute top-[22rem] right-[16rem] size-[18rem] animate-spin-slow-rev text-silver/[0.1] max-lg:hidden" spokes={false} />
      {variant === "hero" && (
        <>
          <Gear teeth={20} className="absolute -bottom-52 -left-40 size-[38rem] animate-spin-slow-rev text-royal/30" />
          <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-background to-transparent" />
        </>
      )}
      <div className="bg-noise absolute inset-0" />
    </div>
  );
}
