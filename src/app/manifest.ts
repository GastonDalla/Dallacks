import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dallacks",
    short_name: "Dallacks",
    description: "Discover music by similarity and explore tracks that sound like the ones you love.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "es",
    dir: "ltr",
    categories: ["music", "entertainment"],
    icons: [
      {
        src: "/icon-192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  };
}
