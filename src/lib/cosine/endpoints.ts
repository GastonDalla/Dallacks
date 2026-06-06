import "server-only";
import { cosineFetch } from "./client";
import * as S from "./schemas";

type Signal = { signal?: AbortSignal };

export async function searchTracks(params: S.SearchQuery, opts: Signal = {}) {
  const json = await cosineFetch("/search", {
    query: { q: params.q, page: params.page, limit: params.limit },
    revalidate: 60,
    signal: opts.signal,
  });
  return S.searchResponseSchema.parse(json);
}

export async function bulkSearch(input: S.BulkRequest, opts: Signal = {}) {
  const json = await cosineFetch("/search/bulk", {
    method: "POST",
    body: input,
    revalidate: false,
    signal: opts.signal,
  });
  return S.bulkResponseSchema.parse(json);
}

export async function lookupTrack(url: string, opts: Signal = {}) {
  const json = await cosineFetch("/tracks/lookup", {
    query: { url },
    revalidate: 300,
    signal: opts.signal,
  });
  return S.lookupResponseSchema.parse(json);
}

export async function getTrack(id: string, opts: Signal = {}) {
  const json = await cosineFetch(`/tracks/${encodeURIComponent(id)}`, {
    revalidate: 300,
    signal: opts.signal,
  });
  return S.trackResponseSchema.parse(json);
}

export async function getSimilar(
  id: string,
  filters: S.SimilarFilters = {},
  opts: Signal = {},
) {
  const json = await cosineFetch(`/tracks/${encodeURIComponent(id)}/similar`, {
    query: { ...filters },
    revalidate: 300,
    signal: opts.signal,
  });
  return S.similarResponseSchema.parse(json);
}
