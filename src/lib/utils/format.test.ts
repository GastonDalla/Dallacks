import { describe, expect, it } from "vitest";
import { artistAndTitle, formatScore, scoreToPercent, trackHref } from "./format";

describe("scoreToPercent", () => {
  it("converts 0..1 scores to integer percentages", () => {
    expect(scoreToPercent(0.87)).toBe(87);
    expect(scoreToPercent(0)).toBe(0);
    expect(scoreToPercent(1)).toBe(100);
  });
  it("clamps out-of-range values", () => {
    expect(scoreToPercent(1.5)).toBe(100);
    expect(scoreToPercent(-0.2)).toBe(0);
  });
  it("returns null for absent/NaN scores", () => {
    expect(scoreToPercent(undefined)).toBeNull();
    expect(scoreToPercent(null)).toBeNull();
    expect(scoreToPercent(Number.NaN)).toBeNull();
  });
});

describe("formatScore", () => {
  it("renders a percentage string", () => {
    expect(formatScore(0.82)).toBe("82%");
  });
  it("renders empty string when absent", () => {
    expect(formatScore(undefined)).toBe("");
  });
});

describe("trackHref", () => {
  it("builds an encoded detail href", () => {
    expect(trackHref("185450")).toBe("/track/185450");
    expect(trackHref("a/b")).toBe("/track/a%2Fb");
  });
});

describe("artistAndTitle", () => {
  it("prefers explicit artist/track fields", () => {
    expect(artistAndTitle({ artist: "Blawan", track: "Getme", name: "Blawan - Getme" })).toEqual({
      artist: "Blawan",
      title: "Getme",
    });
  });
  it("falls back to parsing name when fields are empty", () => {
    expect(artistAndTitle({ artist: "", track: "", name: "Joy Orbison - Hyph Mngo" })).toEqual({
      artist: "Joy Orbison",
      title: "Hyph Mngo",
    });
  });
});
