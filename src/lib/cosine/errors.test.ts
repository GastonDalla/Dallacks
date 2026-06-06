import { describe, expect, it } from "vitest";
import { CosineError, errorFromUpstream, isCosineError } from "./errors";

describe("errorFromUpstream", () => {
  it("uses the upstream error body's code and message", () => {
    const err = errorFromUpstream(400, {
      success: false,
      error: "Bad Request",
      code: "MISSING_QUERY",
      message: "Query parameter 'q' is required",
      request_id: "xyz789",
      timestamp: 1,
    });
    expect(err).toBeInstanceOf(CosineError);
    expect(err.code).toBe("MISSING_QUERY");
    expect(err.message).toBe("Query parameter 'q' is required");
    expect(err.status).toBe(400);
    expect(err.requestId).toBe("xyz789");
  });

  it("falls back to status-based code/message when body is unparseable", () => {
    const err = errorFromUpstream(401, null);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.status).toBe(401);
    expect(err.message).toMatch(/clave de api/i);
  });

  it("carries retryAfter for rate limits", () => {
    const err = errorFromUpstream(429, null, 30);
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.retryAfter).toBe(30);
  });
});

describe("isCosineError", () => {
  it("type-guards CosineError instances", () => {
    expect(isCosineError(new CosineError("X", "y", 500))).toBe(true);
    expect(isCosineError(new Error("nope"))).toBe(false);
  });
});
