export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
  nonce?: string;
}

export function BreadcrumbJsonLd({ items, nonce }: BreadcrumbJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
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
