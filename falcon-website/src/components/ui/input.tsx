import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-input bg-white/[0.04] px-4 text-[15px] text-foreground shadow-xs transition-[color,box-shadow,border-color,background] outline-none placeholder:text-muted-foreground/70 hover:border-white/25 focus-visible:border-gold/70 focus-visible:bg-white/[0.07] focus-visible:ring-4 focus-visible:ring-gold/15 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(fieldBase, "h-12", className)} {...props} />;
}

export { Input, fieldBase };
