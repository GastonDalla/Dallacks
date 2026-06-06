import type {
  BulkData,
  BulkRequest,
  Meta,
  SimilarData,
  SimilarFilters,
  Track,
} from "@/lib/cosine/types";

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

export interface ApiResponse<T> {
  data: T;
  meta?: Meta;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiClientError("NETWORK_ERROR", "network", 0);
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
  }

  const envelope = json as { ok?: boolean; data?: T; meta?: Meta; error?: { code: string; message: string; status: number } } | null;

  if (!res.ok || !envelope?.ok) {
    const err = envelope?.error;
    throw new ApiClientError(err?.code ?? "HTTP_ERROR", err?.message ?? res.statusText, err?.status ?? res.status);
  }

  return { data: envelope.data as T, meta: envelope.meta };
}

function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  search: (q: string, signal?: AbortSignal) =>
    request<Track[]>(`/api/search${qs({ q })}`, { signal }),

  lookup: (url: string, signal?: AbortSignal) =>
    request<Track[]>(`/api/lookup${qs({ url })}`, { signal }),

  getTrack: (id: string, signal?: AbortSignal) =>
    request<Track>(`/api/tracks/${encodeURIComponent(id)}`, { signal }),

  similar: (id: string, filters: SimilarFilters = {}, signal?: AbortSignal) =>
    request<SimilarData>(`/api/tracks/${encodeURIComponent(id)}/similar${qs(filters as Record<string, string | number | undefined>)}`, { signal }),

  bulk: (body: BulkRequest, signal?: AbortSignal) =>
    request<BulkData>("/api/bulk", { method: "POST", body: JSON.stringify(body), signal }),
};
