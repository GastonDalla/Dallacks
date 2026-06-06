"use client";

import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils/cn";

export interface ShareButtonProps {
  url: string;
  title: string;
  label: string;
  copiedMessage: string;
  className?: string;
}

export function ShareButton({ url, title, label, copiedMessage, className }: ShareButtonProps) {
  const { toast } = useToast();

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(url);
      toast(copiedMessage, "success");
    } catch {
      toast(label, "error");
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyToClipboard();
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-pill text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="M16 6l-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
    </button>
  );
}
