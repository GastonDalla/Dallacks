const AMBER = 0xff7a1a;

interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface Embed {
  title: string;
  url?: string;
  description?: string;
  color: number;
  fields: EmbedField[];
  footer: { text: string };
}

function trunc(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export interface TrackEventInput {
  artist: string;
  title: string;
  url: string;
  source?: string;
  locale: string;
  similarCount: number;
  topSimilar: string[];
  filters: Record<string, unknown>;
}

export function trackEmbed(input: TrackEventInput): Embed {
  const fields: EmbedField[] = [
    { name: "Similares", value: String(input.similarCount), inline: true },
    { name: "Idioma", value: input.locale, inline: true },
  ];
  if (input.source) fields.push({ name: "Fuente", value: input.source, inline: true });

  const activeFilters = Object.entries(input.filters).filter(
    ([, value]) => value !== undefined && value !== "" && value !== null,
  );
  if (activeFilters.length > 0) {
    fields.push({
      name: "Filtros",
      value: trunc(activeFilters.map(([key, value]) => `${key}: ${String(value)}`).join(" · "), 1024),
    });
  }
  if (input.topSimilar.length > 0) {
    fields.push({ name: "Top similares", value: trunc(input.topSimilar.join("\n"), 1024) });
  }

  return {
    title: trunc(`🎵 ${input.artist} — ${input.title}`, 256),
    url: input.url,
    color: AMBER,
    fields,
    footer: { text: "Dallacks · búsqueda de similares" },
  };
}

export interface BulkEventInput {
  total: number;
  matched: number;
  unmatched: string[];
  lines: { query: string; count: number }[];
}

export function bulkEmbed(input: BulkEventInput): Embed {
  const fields: EmbedField[] = [
    { name: "Buscados", value: String(input.total), inline: true },
    { name: "Encontrados", value: String(input.matched), inline: true },
    { name: "Sin coincidencia", value: String(input.unmatched.length), inline: true },
  ];
  if (input.lines.length > 0) {
    fields.push({
      name: "Resultados",
      value: trunc(input.lines.map((l) => `• ${l.query} → ${l.count} similares`).join("\n"), 1024),
    });
  }
  if (input.unmatched.length > 0) {
    fields.push({
      name: "No encontrados",
      value: trunc(input.unmatched.map((u) => `• ${u}`).join("\n"), 1024),
    });
  }

  return {
    title: `📦 Búsqueda en lote (${input.total} tracks)`,
    color: AMBER,
    fields,
    footer: { text: "Dallacks · bulk" },
  };
}

export interface LookupEventInput {
  url: string;
  tracks: { artist: string; title: string }[];
}

export function lookupEmbed(input: LookupEventInput): Embed {
  const fields: EmbedField[] = [
    { name: "Tracks encontrados", value: String(input.tracks.length), inline: true },
  ];
  if (input.tracks.length > 0) {
    fields.push({
      name: "Resultados",
      value: trunc(input.tracks.map((t) => `• ${t.artist} — ${t.title}`).join("\n"), 1024),
    });
  }

  return {
    title: "🔗 Lookup por link",
    url: input.url,
    description: trunc(input.url, 2048),
    color: AMBER,
    fields,
    footer: { text: "Dallacks · lookup" },
  };
}
