"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SimilarFilters as SimilarFiltersValue } from "@/lib/cosine/types";

type FilterKey = Exclude<keyof SimilarFiltersValue, "page" | "limit">;

export interface SimilarFiltersProps {
  value: SimilarFiltersValue;
  onChange: (next: SimilarFiltersValue) => void;
  onReset: () => void;
  className?: string;
}

const FILTER_KEYS: FilterKey[] = [
  "start_year",
  "end_year",
  "min_have",
  "max_have",
  "min_want",
  "max_want",
  "min_price",
  "max_price",
];

function countActive(value: SimilarFiltersValue): number {
  return FILTER_KEYS.reduce((n, key) => (value[key] !== undefined ? n + 1 : n), 0);
}

export function SimilarFilters({ value, onChange, onReset, className }: SimilarFiltersProps) {
  const t = useTranslations("filters");
  const active = countActive(value);

  function update(key: FilterKey, raw: string) {
    const next: SimilarFiltersValue = { ...value };
    if (raw === "") {
      delete next[key];
    } else {
      const num = Number(raw);
      if (Number.isNaN(num)) return;
      next[key] = num;
    }
    onChange(next);
  }

  const field = (key: FilterKey, label: string, opts: { min?: number; max?: number; step?: string } = {}) => (
    <Input
      type="number"
      inputMode="numeric"
      label={label}
      value={value[key] ?? ""}
      min={opts.min}
      max={opts.max}
      step={opts.step}
      onChange={(e) => update(key, e.target.value)}
    />
  );

  return (
    <details
      className={`group rounded-2xl border border-border bg-surface ${className ?? ""}`}
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-lg text-fg [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {t("title")}
          {active > 0 ? <Badge variant="accent">{t("active", { count: active })}</Badge> : null}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="border-t border-border p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("start_year", t("yearFrom"), { min: 1900, max: 2030 })}
          {field("end_year", t("yearTo"), { min: 1900, max: 2030 })}
          {field("min_have", t("collectorsMin"), { min: 0 })}
          {field("max_have", t("collectorsMax"), { min: 0 })}
          {field("min_want", t("wishlistsMin"), { min: 0 })}
          {field("max_want", t("wishlistsMax"), { min: 0 })}
          {field("min_price", t("priceMin"), { min: 0, step: "0.01" })}
          {field("max_price", t("priceMax"), { min: 0, step: "0.01" })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} disabled={active === 0}>
            {t("reset")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => onChange({ ...value })}>
            {t("apply")}
          </Button>
        </div>
      </div>
    </details>
  );
}
