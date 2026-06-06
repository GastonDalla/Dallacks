"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

export type SearchMode = "name" | "link";

export interface SearchModeToggleProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
  className?: string;
}

const MODES: readonly SearchMode[] = ["name", "link"] as const;

export function SearchModeToggle({ mode, onChange, className }: SearchModeToggleProps) {
  const t = useTranslations("search");

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex items-center rounded-pill border border-border bg-surface p-1",
        className,
      )}
    >
      {MODES.map((m) => {
        const isActive = m === mode;
        return (
          <button
            key={m}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(m)}
            className={cn(
              "rounded-pill px-4 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
              isActive
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-fg",
            )}
          >
            {m === "name" ? t("modeName") : t("modeLink")}
          </button>
        );
      })}
    </div>
  );
}
