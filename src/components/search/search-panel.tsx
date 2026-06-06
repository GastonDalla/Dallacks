"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { SearchModeToggle, type SearchMode } from "./search-mode-toggle";
import { SearchCombobox } from "./search-combobox";

export interface SearchPanelProps {
  defaultMode?: SearchMode;
  className?: string;
}

export function SearchPanel({ defaultMode = "name", className }: SearchPanelProps) {
  const [mode, setMode] = useState<SearchMode>(defaultMode);

  return (
    <div className={cn("flex w-full flex-col items-center gap-4", className)}>
      <SearchModeToggle mode={mode} onChange={setMode} />
      <SearchCombobox mode={mode} className="max-w-2xl" />
    </div>
  );
}
