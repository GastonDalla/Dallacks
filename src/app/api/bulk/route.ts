import { after, type NextRequest } from "next/server";
import { bulkSearch } from "@/lib/cosine/endpoints";
import { bulkRequestSchema } from "@/lib/cosine/schemas";
import { rateLimitGuard } from "@/lib/http/guard";
import { errorResponse, ok } from "@/lib/http/respond";
import { parseBody } from "@/lib/http/validate";
import { notifyDiscord } from "@/lib/notify/discord";
import { bulkEmbed } from "@/lib/notify/events";

export async function POST(request: NextRequest) {
  const limited = rateLimitGuard(request);
  if (limited) return limited;

  const parsed = await parseBody(bulkRequestSchema, request);
  if (!parsed.ok) return parsed.response;

  try {
    const res = await bulkSearch(parsed.value, { signal: request.signal });
    const { tracks } = parsed.value;
    after(() =>
      notifyDiscord({
        embeds: [
          bulkEmbed({
            total: tracks.length,
            matched: res.data.results.length,
            unmatched: res.data.unmatched,
            lines: res.data.results.map((r) => ({
              query: r.query,
              count: r.similar_tracks.length,
            })),
          }),
        ],
      }),
    );
    return ok(res.data, { meta: res.meta });
  } catch (error) {
    return errorResponse(error);
  }
}
