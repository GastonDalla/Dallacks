import { describe, expect, it } from "vitest";
import { bulkEmbed, lookupEmbed, trackEmbed } from "./events";

const byName = (fields: { name: string; value: string }[]) =>
  Object.fromEntries(fields.map((f) => [f.name, f.value]));

describe("trackEmbed", () => {
  it("includes the similar count, top tracks and only active filters", () => {
    const embed = trackEmbed({
      artist: "Joy Orbison",
      title: "Hyph Mngo",
      url: "https://x/track/1",
      source: "Discogs",
      locale: "es",
      similarCount: 20,
      topSimilar: ["1. A — B (87%)", "2. C — D (82%)"],
      filters: { start_year: 2005, limit: undefined },
    });

    expect(embed.title).toContain("Joy Orbison — Hyph Mngo");
    expect(embed.url).toBe("https://x/track/1");
    const f = byName(embed.fields);
    expect(f["Similares"]).toBe("20");
    expect(f["Fuente"]).toBe("Discogs");
    expect(f["Filtros"]).toContain("start_year: 2005");
    expect(f["Filtros"]).not.toContain("limit");
    expect(f["Top similares"]).toContain("87%");
  });
});

describe("bulkEmbed", () => {
  it("reports matched / unmatched and per-track similar counts", () => {
    const embed = bulkEmbed({
      total: 2,
      matched: 1,
      unmatched: ["X - Y"],
      lines: [{ query: "A - B", count: 10 }],
    });

    const f = byName(embed.fields);
    expect(f["Buscados"]).toBe("2");
    expect(f["Encontrados"]).toBe("1");
    expect(f["Sin coincidencia"]).toBe("1");
    expect(f["Resultados"]).toContain("A - B → 10 similares");
    expect(f["No encontrados"]).toContain("X - Y");
  });
});

describe("lookupEmbed", () => {
  it("lists the found tracks and keeps the url", () => {
    const embed = lookupEmbed({
      url: "https://discogs.com/release/1",
      tracks: [{ artist: "A", title: "B" }],
    });

    expect(embed.url).toBe("https://discogs.com/release/1");
    const f = byName(embed.fields);
    expect(f["Tracks encontrados"]).toBe("1");
    expect(f["Resultados"]).toContain("A — B");
  });
});
