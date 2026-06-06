"use client";

import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils/cn";

export interface CopyButtonProps {
  value: string;
  label: string;
  copiedMessage: string;
  className?: string;
}

export function CopyButton({ value, label, copiedMessage, className }: CopyButtonProps) {
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast(copiedMessage, "success");
    } catch {
      toast(label, "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-pill text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
    </button>
  );
}
