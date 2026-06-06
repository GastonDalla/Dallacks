"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { SimilarFilters } from "@/lib/cosine/types";

export const queryKeys = {
  search: (q: string) => ["search", q] as const,
  similar: (id: string, filters: SimilarFilters) => ["similar", id, filters] as const,
  track: (id: string) => ["track", id] as const,
};

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: ({ signal }) => api.search(query, signal).then((r) => r.data),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useSimilar(id: string, filters: SimilarFilters = {}) {
  return useQuery({
    queryKey: queryKeys.similar(id, filters),
    queryFn: ({ signal }) => api.similar(id, filters, signal),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}
