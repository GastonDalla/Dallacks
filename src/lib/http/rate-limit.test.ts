import { beforeEach, describe, expect, it } from "vitest";
import { clientIp, rateLimit, resetRateLimit } from "./rate-limit";

describe("rateLimit (token bucket)", () => {
  beforeEach(() => resetRateLimit());

  it("allows requests up to capacity then blocks", () => {
    const opts = { capacity: 3, refillPerSecond: 1, now: 1000 };
    expect(rateLimit("ip", opts).allowed).toBe(true);
    expect(rateLimit("ip", opts).allowed).toBe(true);
    expect(rateLimit("ip", opts).allowed).toBe(true);
    const blocked = rateLimit("ip", opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("refills tokens over time", () => {
    const base = { capacity: 2, refillPerSecond: 1 };
    rateLimit("ip", { ...base, now: 0 });
    rateLimit("ip", { ...base, now: 0 });
    expect(rateLimit("ip", { ...base, now: 0 }).allowed).toBe(false);
    expect(rateLimit("ip", { ...base, now: 2000 }).allowed).toBe(true);
  });

  it("isolates buckets per key", () => {
    const opts = { capacity: 1, refillPerSecond: 1, now: 0 };
    expect(rateLimit("a", opts).allowed).toBe(true);
    expect(rateLimit("b", opts).allowed).toBe(true);
    expect(rateLimit("a", opts).allowed).toBe(false);
  });

  it("reports the configured limit", () => {
    expect(rateLimit("ip", { capacity: 60, now: 0 }).limit).toBe(60);
  });
});

describe("clientIp", () => {
  it("reads the first x-forwarded-for entry", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(clientIp(req)).toBe("203.0.113.7");
  });
  it("falls back to x-real-ip then 'unknown'", () => {
    expect(clientIp(new Request("https://x.test", { headers: { "x-real-ip": "198.51.100.2" } }))).toBe(
      "198.51.100.2",
    );
    expect(clientIp(new Request("https://x.test"))).toBe("unknown");
  });
});
