import "server-only";
import { CosineError, errorFromUpstream } from "./errors";

const DEFAULT_BASE = "https://cosine.club/api/v1";
const USER_AGENT = "dallacks/1.0 (+https://github.com/Chicho/Dallacks)";
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 5_000;

function baseUrl(): string {
  return (process.env.COSINE_API_BASE_URL ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function apiKey(): string {
  const key = process.env.COSINE_API_KEY;
  if (!key) {
    throw new CosineError(
      "CONFIG_ERROR",
      "Falta configurar COSINE_API_KEY en el servidor.",
      500,
    );
  }
  return key;
}

export type QueryValue = string | number | boolean | undefined | null;

export interface CosineRequest {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  revalidate?: number | false;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(baseUrl() + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function combinedSignal(external?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  return external ? AbortSignal.any([external, timeout]) : timeout;
}

function retryDelay(response: Response, attempt: number): number {
  const header = response.headers.get("retry-after");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);
  }
  return Math.min(2 ** attempt * 500, MAX_RETRY_DELAY_MS);
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function cosineFetch<T = unknown>(
  path: string,
  opts: CosineRequest = {},
): Promise<T> {
  const { method = "GET", query, body, signal, revalidate } = opts;
  const url = buildUrl(path, query);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey()}`,
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: combinedSignal(signal),
        ...(revalidate === undefined ? {} : { next: { revalidate } }),
      });
    } catch (cause) {
      lastError = cause;
      if (signal?.aborted) {
        throw new CosineError("ABORTED", "La solicitud fue cancelada.", 499, { cause });
      }
      if (attempt < MAX_RETRIES) {
        await sleep(retryDelay(new Response(), attempt));
        continue;
      }
      throw new CosineError(
        "NETWORK_ERROR",
        "No se pudo contactar el servicio de música.",
        502,
        { cause },
      );
    }

    if (response.ok) {
      return (await readJson(response)) as T;
    }

    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      await sleep(retryDelay(response, attempt));
      continue;
    }

    const errorBody = await readJson(response);
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : undefined;
    throw errorFromUpstream(response.status, errorBody, retryAfter);
  }

  throw lastError instanceof CosineError
    ? lastError
    : new CosineError("RATE_LIMITED", "Se alcanzó el límite de solicitudes. Probá más tarde.", 429);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
