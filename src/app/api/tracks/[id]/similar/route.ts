import type { NextRequest } from "next/server";
import { getSimilar } from "@/lib/cosine/endpoints";
import { similarFiltersSchema } from "@/lib/cosine/schemas";
import { rateLimitGuard } from "@/lib/http/guard";
import { errorResponse, fail, ok, publicCache } from "@/lib/http/respond";
import { parseQuery } from "@/lib/http/validate";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimitGuard(request);
  if (limited) return limited;

  const { id } = await params;
  if (!id) return fail("VALIDATION_ERROR", "Falta el id del track.", 400);

  const parsed = parseQuery(similarFiltersSchema, request.nextUrl.searchParams);
  if (!parsed.ok) return parsed.response;

  try {
    const res = await getSimilar(id, parsed.value, { signal: request.signal });
    return ok(res.data, { meta: res.meta, headers: publicCache(300) });
  } catch (error) {
    return errorResponse(error);
  }
}
