import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <h2 className="font-display text-xl text-fg text-balance">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-muted text-balance">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
