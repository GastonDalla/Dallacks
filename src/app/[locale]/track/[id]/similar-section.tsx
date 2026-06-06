"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { SimilarFilters } from "@/components/track/similar-filters";
import { SimilarGrid } from "@/components/track/similar-grid";
import type { SimilarFilters as SimilarFiltersValue } from "@/lib/cosine/types";

export interface SimilarSectionProps {
  trackId: string;
  initialFilters: SimilarFiltersValue;
  sourceName?: string;
}

function toQueryString(filters: SimilarFiltersValue): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function withoutPage(filters: SimilarFiltersValue): SimilarFiltersValue {
  const next: SimilarFiltersValue = { ...filters };
  delete next.page;
  return next;
}

export function SimilarSection({ trackId, initialFilters, sourceName }: SimilarSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<SimilarFiltersValue>(initialFilters);

  const sync = useCallback(
    (next: SimilarFiltersValue) => {
      setFilters(next);
      router.replace(`${pathname}${toQueryString(next)}`, { scroll: false });
    },
    [router, pathname],
  );

  const handleFilterChange = useCallback(
    (next: SimilarFiltersValue) => {
      sync(withoutPage(next));
    },
    [sync],
  );

  const handleReset = useCallback(() => {
    sync({});
  }, [sync]);

  const handlePageChange = useCallback(
    (page: number) => {
      const base = withoutPage(filters);
      sync(page > 1 ? { ...base, page } : base);
    },
    [filters, sync],
  );

  return (
    <div className="flex flex-col gap-8">
      <SimilarFilters value={filters} onChange={handleFilterChange} onReset={handleReset} />
      <SimilarGrid
        trackId={trackId}
        filters={filters}
        sourceName={sourceName}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
