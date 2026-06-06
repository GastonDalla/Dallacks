import localFont from "next/font/local";

export const satoshi = localFont({
  src: [
    { path: "../../public/fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/satoshi-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const clashDisplay = localFont({
  src: [
    { path: "../../public/fonts/clash-display-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/clash-display-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/clash-display-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});
