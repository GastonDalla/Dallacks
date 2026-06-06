import { describe, expect, it } from "vitest";
import { isAllowedLookupUrl, parseYouTubeId } from "./url";

describe("isAllowedLookupUrl (SSRF guard)", () => {
  it("accepts allow-listed music hosts", () => {
    expect(isAllowedLookupUrl("https://www.discogs.com/release/123")).toBe(true);
    expect(isAllowedLookupUrl("https://discogs.com/release/123")).toBe(true);
    expect(isAllowedLookupUrl("https://www.youtube.com/watch?v=abcdefghijk")).toBe(true);
    expect(isAllowedLookupUrl("https://youtu.be/abcdefghijk")).toBe(true);
    expect(isAllowedLookupUrl("https://soundcloud.com/artist/track")).toBe(true);
  });

  it("rejects non-allow-listed and internal hosts", () => {
    expect(isAllowedLookupUrl("https://evil.com/x")).toBe(false);
    expect(isAllowedLookupUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isAllowedLookupUrl("http://localhost:8080/admin")).toBe(false);
    expect(isAllowedLookupUrl("https://discogs.com.evil.com/x")).toBe(false);
  });

  it("rejects non-http(s) protocols and garbage", () => {
    expect(isAllowedLookupUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedLookupUrl("ftp://discogs.com/x")).toBe(false);
    expect(isAllowedLookupUrl("not a url")).toBe(false);
    expect(isAllowedLookupUrl("")).toBe(false);
  });
});

describe("parseYouTubeId", () => {
  it("extracts ids from watch, short, and embed URLs", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=FkUd5C8ApdI")).toBe("FkUd5C8ApdI");
    expect(parseYouTubeId("https://youtu.be/FkUd5C8ApdI")).toBe("FkUd5C8ApdI");
    expect(parseYouTubeId("https://www.youtube.com/embed/FkUd5C8ApdI")).toBe("FkUd5C8ApdI");
  });

  it("passes through bare 11-char ids", () => {
    expect(parseYouTubeId("FkUd5C8ApdI")).toBe("FkUd5C8ApdI");
  });

  it("returns null for missing or invalid input", () => {
    expect(parseYouTubeId(undefined)).toBeNull();
    expect(parseYouTubeId(null)).toBeNull();
    expect(parseYouTubeId("https://example.com/no-id")).toBeNull();
  });
});
