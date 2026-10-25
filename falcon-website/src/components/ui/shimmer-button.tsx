/**
 * Shimmer Button — from 21st.dev (https://21st.dev/@dillionverma/components/shimmer-button, Magic UI).
 * Adapted: asChild support so it can render as a link, brand gold defaults.
 */
import React, { type CSSProperties } from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  asChild?: boolean;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#f1d38a",
      shimmerSize = "0.06em",
      shimmerDuration = "3.2s",
      borderRadius = "100px",
      background = "linear-gradient(180deg, #0f2250 0%, #08122b 100%)",
      className,
      children,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden border border-gold/30 px-7 py-3 text-sm font-semibold whitespace-nowrap text-white [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-px",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <span className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]" aria-hidden>
          {/* spark */}
          <span className="absolute inset-0 aspect-square h-[100cqh] animate-shimmer-slide [border-radius:0] [mask:none]">
            {/* spark before */}
            <span className="absolute -inset-full w-auto animate-spin-around rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </span>
        </span>
        <Slot.Slottable>{children}</Slot.Slottable>
        {/* highlight */}
        <span
          aria-hidden
          className="absolute size-full rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
        />
        {/* backdrop */}
        <span aria-hidden className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
      </Comp>
    );
  },
);
ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
