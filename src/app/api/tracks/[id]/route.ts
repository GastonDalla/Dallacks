import type { NextRequest } from "next/server";
import { getTrack } from "@/lib/cosine/endpoints";
import { rateLimitGuard } from "@/lib/http/guard";
import { errorResponse, fail, ok, publicCache } from "@/lib/http/respond";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimitGuard(request);
  if (limited) return limited;

  const { id } = await params;
  if (!id) return fail("VALIDATION_ERROR", "Falta el id del track.", 400);

  try {
    const res = await getTrack(id, { signal: request.signal });
    return ok(res.data, { meta: res.meta, headers: publicCache(300) });
  } catch (error) {
    return errorResponse(error);
  }
}
