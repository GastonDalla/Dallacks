import type { NextRequest } from "next/server";
import { lookupTrack } from "@/lib/cosine/endpoints";
import { lookupQuerySchema } from "@/lib/cosine/schemas";
import { rateLimitGuard } from "@/lib/http/guard";
import { errorResponse, fail, ok, publicCache } from "@/lib/http/respond";
import { parseQuery } from "@/lib/http/validate";
import { isAllowedLookupUrl } from "@/lib/utils/url";

export async function GET(request: NextRequest) {
  const limited = rateLimitGuard(request);
  if (limited) return limited;

  const parsed = parseQuery(lookupQuerySchema, request.nextUrl.searchParams);
  if (!parsed.ok) return parsed.response;

  if (!isAllowedLookupUrl(parsed.value.url)) {
    return fail(
      "INVALID_URL",
      "Ese link no es de un servicio soportado (Discogs, YouTube o SoundCloud).",
      400,
    );
  }

  try {
    const res = await lookupTrack(parsed.value.url, { signal: request.signal });
    return ok(res.data, { meta: res.meta, headers: publicCache(300) });
  } catch (error) {
    return errorResponse(error);
  }
}
