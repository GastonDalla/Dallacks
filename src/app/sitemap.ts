import type { MetadataRoute } from "next";
import { SITE_URL as siteUrl } from "@/lib/site";

const paths = ["", "/bulk"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return paths.map((path) => {
    const es = `${siteUrl}${path}`;
    const en = `${siteUrl}/en${path}`;

    return {
      url: es,
      lastModified,
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: {
          es,
          en,
          "x-default": es,
        },
      },
    };
  });
}
