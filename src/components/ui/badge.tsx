import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant = "default" | "accent" | "outline";

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-muted",
  accent: "bg-accent/15 text-accent",
  outline: "border border-border text-muted",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
