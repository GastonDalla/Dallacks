import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { resetRateLimit } from "@/lib/http/rate-limit";

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (fn: () => void) => fn() };
});

import { GET } from "./route";

const req = (url: string) => new NextRequest(url);

beforeEach(() => resetRateLimit());

describe("GET /api/lookup (SSRF guard)", () => {
  it("rejects a non-allow-listed host with 400 INVALID_URL", async () => {
    const res = await GET(req("http://localhost/api/lookup?url=https://evil.com/x"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_URL");
  });

  it("rejects internal metadata endpoints", async () => {
    const res = await GET(
      req("http://localhost/api/lookup?url=" + encodeURIComponent("http://169.254.169.254/latest/meta-data")),
    );
    expect(res.status).toBe(400);
  });

  it("forwards an allow-listed Discogs URL", async () => {
    const res = await GET(
      req("http://localhost/api/lookup?url=" + encodeURIComponent("https://discogs.com/release/1")),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(1);
  });

  it("requires the url param", async () => {
    const res = await GET(req("http://localhost/api/lookup"));
    expect(res.status).toBe(400);
  });
});
