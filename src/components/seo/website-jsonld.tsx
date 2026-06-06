import { SITE_URL } from "@/lib/site";

export interface WebsiteJsonLdProps {
  nonce?: string;
}

export function WebsiteJsonLd({ nonce }: WebsiteJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Dallacks",
        url: SITE_URL,
        description:
          "Discover tracks that sound alike. Enter a track name or paste a Discogs, YouTube, or SoundCloud link and get similar-sounding tracks you can play in-page.",
        inLanguage: ["es", "en"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Dallacks",
        url: SITE_URL,
        description:
          "Music similarity discovery tool powered by cosine.club audio embeddings.",
      },
    ],
  };

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
