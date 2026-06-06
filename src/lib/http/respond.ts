import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Meta } from "@/lib/cosine/schemas";
import { isCosineError } from "@/lib/cosine/errors";

interface OkOptions {
  meta?: Meta;
  status?: number;
  headers?: Record<string, string>;
}

export function ok<T>(data: T, options: OkOptions = {}): NextResponse {
  const body = options.meta ? { ok: true, data, meta: options.meta } : { ok: true, data };
  return NextResponse.json(body, {
    status: options.status ?? 200,
    headers: options.headers,
  });
}

export function fail(
  code: string,
  message: string,
  status: number,
  headers?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code, message, status } },
    { status, headers },
  );
}

export function errorResponse(error: unknown): NextResponse {
  if (isCosineError(error)) {
    const headers = error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined;
    return fail(error.code, error.message, error.status, headers);
  }
  if (error instanceof ZodError) {
    return fail(
      "UPSTREAM_CONTRACT",
      "El servicio de música devolvió datos en un formato inesperado.",
      502,
    );
  }
  return fail("INTERNAL_ERROR", "Ocurrió un error inesperado.", 500);
}

export function publicCache(seconds: number): Record<string, string> {
  return {
    "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`,
  };
}
