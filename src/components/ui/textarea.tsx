"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const field =
  "block w-full rounded-xl border bg-surface px-4 py-3 min-h-28 text-fg placeholder:text-faint " +
  "transition-colors outline-none resize-y " +
  "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Textarea({ label, hint, error, id, className, ...props }: TextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-fg">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(field, error && "border-danger focus-visible:border-danger focus-visible:ring-danger/40", !error && "border-border", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
