import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { COSINE_BASE } from "@/test/msw/handlers";
import * as fx from "@/test/fixtures";
import { CosineError } from "./errors";
import {
  bulkSearch,
  getSimilar,
  getTrack,
  lookupTrack,
  searchTracks,
} from "./endpoints";

describe("endpoints — happy paths", () => {
  it("searchTracks returns validated tracks", async () => {
    const res = await searchTracks({ q: "hyph" });
    expect(res.data).toHaveLength(2);
    expect(res.data[0]?.artist).toBe("Joy Orbison");
  });

  it("getSimilar returns source + similar tracks", async () => {
    const res = await getSimilar("185450", { limit: 20 });
    expect(res.data.source_track.id).toBe("185450");
    expect(res.data.similar_tracks[0]?.score).toBe(0.87);
  });

  it("getTrack returns a single track", async () => {
    expect((await getTrack("185450")).data.id).toBe("185450");
  });

  it("lookupTrack returns an array of tracks", async () => {
    expect((await lookupTrack("https://discogs.com/release/1")).data).toHaveLength(1);
  });

  it("bulkSearch returns results + unmatched", async () => {
    const res = await bulkSearch({ tracks: ["Joy Orbison - Hyph Mngo"] });
    expect(res.data.results[0]?.similar_tracks).toHaveLength(2);
    expect(res.data.unmatched).toEqual([]);
  });
});

describe("endpoints — auth + error mapping", () => {
  it("sends a Bearer token to the upstream", async () => {
    let auth: string | null = null;
    server.use(
      http.get(`${COSINE_BASE}/search`, ({ request }) => {
        auth = request.headers.get("authorization");
        return HttpResponse.json(fx.searchResponse);
      }),
    );
    await searchTracks({ q: "hyph" });
    expect(auth).toBe("Bearer test-api-key");
  });

  it("maps a 404 to a CosineError with status 404", async () => {
    server.use(
      http.get(`${COSINE_BASE}/tracks/:id`, () =>
        HttpResponse.json(fx.errorBody("Not Found", "TRACK_NOT_FOUND", "Track not found"), { status: 404 }),
      ),
    );
    await expect(getTrack("000")).rejects.toMatchObject({
      status: 404,
      code: "TRACK_NOT_FOUND",
    });
  });

  it("maps a 401 to a CosineError", async () => {
    server.use(
      http.get(`${COSINE_BASE}/search`, () =>
        HttpResponse.json(fx.errorBody("Unauthorized", "INVALID_KEY", "Invalid API key"), { status: 401 }),
      ),
    );
    const err = await searchTracks({ q: "hyph" }).catch((e) => e);
    expect(err).toBeInstanceOf(CosineError);
    expect(err.status).toBe(401);
  });

  it("rejects when the upstream payload violates the schema", async () => {
    server.use(
      http.get(`${COSINE_BASE}/search`, () => HttpResponse.json({ success: true, data: [{ id: 1 }], meta: {} })),
    );
    await expect(searchTracks({ q: "hyph" })).rejects.toBeTruthy();
  });
});
