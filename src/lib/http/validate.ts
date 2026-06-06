import type { NextResponse } from "next/server";
import { ZodError, type z } from "zod";
import { fail } from "./respond";

export type Parsed<T> = { ok: true; value: T } | { ok: false; response: NextResponse };

export function parseQuery<T>(schema: z.ZodType<T>, searchParams: URLSearchParams): Parsed<T> {
  const obj: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) obj[key] = value;
  const result = schema.safeParse(obj);
  if (!result.success) return { ok: false, response: validationFail(result.error) };
  return { ok: true, value: result.data };
}

export async function parseBody<T>(
  schema: z.ZodType<T>,
  request: Request,
): Promise<Parsed<T>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { ok: false, response: fail("INVALID_JSON", "El cuerpo no es JSON válido.", 400) };
  }
  const result = schema.safeParse(json);
  if (!result.success) return { ok: false, response: validationFail(result.error) };
  return { ok: true, value: result.data };
}

export function parseId(raw: string): Parsed<number> {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    return { ok: false, response: fail("VALIDATION_ERROR", "id inválido.", 400) };
  }
  return { ok: true, value: n };
}

function validationFail(error: ZodError): NextResponse {
  const issue = error.issues[0];
  const path = issue?.path.join(".");
  const message = issue
    ? `${path ? `${path}: ` : ""}${issue.message}`
    : "Datos inválidos.";
  return fail("VALIDATION_ERROR", message, 400);
}
