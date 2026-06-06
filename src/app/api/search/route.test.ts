import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { http, HttpResponse } from "msw";
import { COSINE_BASE, server } from "@/test/server";
import * as fx from "@/test/fixtures";
import { resetRateLimit } from "@/lib/http/rate-limit";
import { GET } from "./route";

const req = (url: string) => new NextRequest(url);

beforeEach(() => resetRateLimit());

describe("GET /api/search", () => {
  it("returns the ok envelope with validated data", async () => {
    const res = await GET(req("http://localhost/api/search?q=hyph"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(2);
    expect(res.headers.get("cache-control")).toContain("s-maxage=60");
  });

  it("rejects a too-short query with 400 VALIDATION_ERROR", async () => {
    const res = await GET(req("http://localhost/api/search?q=a"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("maps an upstream 401 without ever leaking the API key", async () => {
    server.use(
      http.get(`${COSINE_BASE}/search`, () =>
        HttpResponse.json(fx.errorBody("Unauthorized", "INVALID_KEY", "Invalid API key"), { status: 401 }),
      ),
    );
    const res = await GET(req("http://localhost/api/search?q=hyph"));
    expect(res.status).toBe(401);
    const body = JSON.stringify(await res.json());
    expect(body).not.toContain("test-api-key");
    expect(body).not.toContain("Bearer");
  });

  it("returns 429 with Retry-After once the per-IP budget is exhausted", async () => {
    for (let i = 0; i < 60; i++) await GET(req("http://localhost/api/search?q=hyph"));
    const res = await GET(req("http://localhost/api/search?q=hyph"));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
  });
});
