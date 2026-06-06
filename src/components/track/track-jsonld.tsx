import type { Track } from "@/lib/cosine/types";

export interface TrackJsonLdProps {
  track: Track;
  nonce?: string;
}

export function TrackJsonLd({ track, nonce }: TrackJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: track.track || track.name,
    byArtist: {
      "@type": "MusicGroup",
      name: track.artist,
    },
  };
  if (track.external_link) data.url = track.external_link;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
