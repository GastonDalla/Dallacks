const ALLOWED_LOOKUP_HOSTS = new Set([
  "discogs.com",
  "www.discogs.com",
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "soundcloud.com",
  "www.soundcloud.com",
  "on.soundcloud.com",
]);

export function isAllowedLookupUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  return ALLOWED_LOOKUP_HOSTS.has(url.hostname.toLowerCase());
}

export function parseYouTubeId(uriOrId?: string | null): string | null {
  if (!uriOrId) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(uriOrId)) return uriOrId;
  try {
    const url = new URL(uriOrId);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1] ?? null;
  } catch {
    return null;
  }
  return null;
}
