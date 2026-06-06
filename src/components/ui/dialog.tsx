"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables?.[0] ?? panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        data-testid="dialog-backdrop"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onClose()}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-glow outline-none",
          className,
        )}
      >
        {title ? (
          <h2 id={titleId} className="mb-4 font-display text-xl text-fg">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}
