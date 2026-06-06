import type { Track } from "@/lib/cosine/schemas";

export function scoreToPercent(score?: number | null): number | null {
  if (score === undefined || score === null || Number.isNaN(score)) return null;
  return Math.round(Math.min(1, Math.max(0, score)) * 100);
}

export function formatScore(score?: number | null): string {
  const pct = scoreToPercent(score);
  return pct === null ? "" : `${pct}%`;
}

export function trackHref(id: string): string {
  return `/track/${encodeURIComponent(id)}`;
}

export function artistAndTitle(track: Pick<Track, "artist" | "track" | "name">): {
  artist: string;
  title: string;
} {
  if (track.artist && track.track) return { artist: track.artist, title: track.track };
  const [artist, ...rest] = track.name.split(" - ");
  return { artist: artist ?? track.name, title: rest.join(" - ") || track.name };
}
