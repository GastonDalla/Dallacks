import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dallacks";

export default async function Image() {
  const clash = await readFile(join(process.cwd(), "src/app/_fonts/clash-display-600.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(1000px circle at 50% 120%, rgba(255,122,26,0.22), transparent 60%)",
          padding: "80px",
          fontFamily: "Clash Display",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "9999px", backgroundColor: "#ff7a1a" }} />
          <div style={{ fontSize: "32px", letterSpacing: "0.34em", color: "#ff7a1a" }}>DALLACKS</div>
        </div>

        <div style={{ display: "flex", fontSize: "176px", lineHeight: 1, color: "#ffffff" }}>Dallacks</div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginTop: "32px",
            fontSize: "40px",
            color: "#b8b8b8",
          }}
        >
          <div style={{ width: "48px", height: "3px", backgroundColor: "#ff7a1a" }} />
          Descubrí música similar
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Clash Display", data: clash, weight: 600 }],
    },
  );
}
