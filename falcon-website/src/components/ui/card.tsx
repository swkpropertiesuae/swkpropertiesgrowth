import * as React from "react";
import { cn } from "@/lib/utils";

const Card = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="card" className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-card text-card-foreground", className)} {...props} />
);
const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="card-header" className={cn("flex flex-col gap-1.5 px-6 pt-6", className)} {...props} />
);
const CardTitle = ({ className, ...props }: React.ComponentProps<"h3">) => (
  <h3 data-slot="card-title" className={cn("text-xl leading-tight font-bold", className)} {...props} />
);
const CardDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
);
const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="card-content" className={cn("px-6", className)} {...props} />
);
const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="card-footer" className={cn("flex items-center px-6 pb-6", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
