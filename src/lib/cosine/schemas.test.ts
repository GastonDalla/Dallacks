import { describe, expect, it } from "vitest";
import {
  bulkRequestSchema,
  createPlaylistSchema,
  searchQuerySchema,
  searchResponseSchema,
  similarFiltersSchema,
  similarResponseSchema,
  trackSchema,
} from "./schemas";
import * as fx from "@/test/fixtures";

describe("trackSchema", () => {
  it("accepts a minimal track (required fields only)", () => {
    expect(trackSchema.parse({ id: "1", name: "A - B", artist: "A", track: "B" }).id).toBe("1");
  });
  it("rejects a track missing required fields", () => {
    expect(trackSchema.safeParse({ id: "1", name: "x" }).success).toBe(false);
  });
});

describe("response schemas", () => {
  it("parses a search response", () => {
    expect(searchResponseSchema.parse(fx.searchResponse).data).toHaveLength(2);
  });
  it("parses a similar response with source_track", () => {
    const parsed = similarResponseSchema.parse(fx.similarResponse);
    expect(parsed.data.source_track.id).toBe("185450");
    expect(parsed.data.similar_tracks[0]?.score).toBe(0.87);
  });
  it("tolerates a thin meta (only request_id + timestamp)", () => {
    expect(similarResponseSchema.safeParse({ ...fx.similarResponse, meta: { request_id: "x", timestamp: 1 } }).success).toBe(true);
  });
});

describe("input validation schemas", () => {
  it("requires a 2-200 char query", () => {
    expect(searchQuerySchema.safeParse({ q: "a" }).success).toBe(false);
    expect(searchQuerySchema.parse({ q: "hyph" }).q).toBe("hyph");
  });
  it("coerces and clamps similar filters", () => {
    const parsed = similarFiltersSchema.parse({ limit: "50", start_year: "2005" });
    expect(parsed.limit).toBe(50);
    expect(parsed.start_year).toBe(2005);
    expect(similarFiltersSchema.safeParse({ limit: "500" }).success).toBe(false);
    expect(similarFiltersSchema.safeParse({ start_year: "1800" }).success).toBe(false);
  });
  it("enforces bulk track bounds (1-50)", () => {
    expect(bulkRequestSchema.safeParse({ tracks: [] }).success).toBe(false);
    expect(bulkRequestSchema.safeParse({ tracks: Array(51).fill("a") }).success).toBe(false);
    expect(bulkRequestSchema.parse({ tracks: ["A - B"] }).tracks).toHaveLength(1);
  });
  it("requires a playlist name", () => {
    expect(createPlaylistSchema.safeParse({}).success).toBe(false);
    expect(createPlaylistSchema.parse({ name: "mix" }).name).toBe("mix");
  });
});
