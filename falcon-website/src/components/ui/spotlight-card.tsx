"use client";
/**
 * Spotlight Card — from 21st.dev (https://21st.dev/@preetsuthar17/components/spotlight-card).
 * Adapted: forwards HTML props, uses design tokens, adds a lit border ring.
 */
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(217,174,76,0.22)",
  ...rest
}: React.ComponentProps<"div"> & { spotlightColor?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => { setIsFocused(true); setOpacity(0.7); }}
      onBlur={() => { setIsFocused(false); setOpacity(0); }}
      onMouseEnter={() => setOpacity(0.7)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden rounded-3xl border border-white/10 bg-card p-8 transition-colors duration-500 hover:border-gold/35", className)}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{ opacity, background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};
