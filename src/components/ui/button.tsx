import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap " +
  "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-press",
  secondary: "border border-border bg-transparent text-fg hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-muted hover:text-fg",
  danger: "border border-danger/40 bg-transparent text-danger hover:bg-danger/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export function buttonClasses(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  const { variant = "primary", size = "md", className } = opts;
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
