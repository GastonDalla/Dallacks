import type { NextRequest } from "next/server";
import { searchTracks } from "@/lib/cosine/endpoints";
import { searchQuerySchema } from "@/lib/cosine/schemas";
import { rateLimitGuard } from "@/lib/http/guard";
import { errorResponse, ok, publicCache } from "@/lib/http/respond";
import { parseQuery } from "@/lib/http/validate";

export async function GET(request: NextRequest) {
  const limited = rateLimitGuard(request);
  if (limited) return limited;

  const parsed = parseQuery(searchQuerySchema, request.nextUrl.searchParams);
  if (!parsed.ok) return parsed.response;

  try {
    const res = await searchTracks(parsed.value, { signal: request.signal });
    return ok(res.data, { meta: res.meta, headers: publicCache(60) });
  } catch (error) {
    return errorResponse(error);
  }
}
