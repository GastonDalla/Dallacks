import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTrack } from "@/lib/cosine/endpoints";
import { artistAndTitle } from "@/lib/utils/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dallacks";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  let title = "Dallacks";
  let artist = "";
  let found = false;

  try {
    const res = await getTrack(id);
    const track = res.data;
    if (track) {
      const parsed = artistAndTitle(track);
      title = parsed.title;
      artist = parsed.artist;
      found = true;
    }
  } catch {
    found = false;
  }

  const hint = locale === "en" ? "similar tracks" : "tracks similares";

  const clash = await readFile(join(process.cwd(), "src/app/_fonts/clash-display-600.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(900px circle at 88% 8%, rgba(255,122,26,0.20), transparent 55%)",
          padding: "72px",
          fontFamily: "Clash Display",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "9999px",
              backgroundColor: "#ff7a1a",
            }}
          />
          <div
            style={{
              fontSize: "30px",
              letterSpacing: "0.32em",
              color: "#ff7a1a",
            }}
          >
            DALLACKS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {found && artist ? (
            <div
              style={{
                fontSize: "40px",
                color: "#b8b8b8",
                marginBottom: "12px",
              }}
            >
              {artist}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: title.length > 36 ? "92px" : "120px",
              lineHeight: 1.02,
              color: "#ffffff",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "32px",
            color: "#b8b8b8",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "3px",
              backgroundColor: "#ff7a1a",
            }}
          />
          {hint}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Clash Display", data: clash, weight: 600 }],
    },
  );
}
