"use client";

import { cn } from "@/lib/utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
  labelPrevious?: string;
  labelNext?: string;
  className?: string;
}

const control =
  "inline-flex size-9 items-center justify-center rounded-pill border border-border text-fg " +
  "transition-colors hover:border-accent hover:text-accent " +
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-40";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  label = "Pagination",
  labelPrevious = "Previous page",
  labelNext = "Next page",
  className,
}: PaginationProps) {
  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <nav aria-label={label} className={cn("flex items-center justify-center gap-3", className)}>
      <button
        type="button"
        className={control}
        aria-label={labelPrevious}
        disabled={atStart}
        onClick={() => {
          if (!atStart) onPageChange(page - 1);
        }}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <p className="text-sm text-muted tabular-nums">
        <span className="text-fg" aria-current="page">
          {page}
        </span>
        <span className="px-1 text-faint">/</span>
        <span>{totalPages}</span>
      </p>

      <button
        type="button"
        className={control}
        aria-label={labelNext}
        disabled={atEnd}
        onClick={() => {
          if (!atEnd) onPageChange(page + 1);
        }}
      >
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}
