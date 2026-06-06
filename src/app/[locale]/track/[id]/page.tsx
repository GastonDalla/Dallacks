import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { YoutubeEmbed } from "@/components/track/youtube-embed";
import { TrackJsonLd } from "@/components/track/track-jsonld";
import { ShareButton } from "@/components/ui/share-button";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { SimilarSection } from "./similar-section";
import { getTrack } from "@/lib/cosine/endpoints";
import { similarFiltersSchema } from "@/lib/cosine/schemas";
import { SITE_URL } from "@/lib/site";
import { artistAndTitle, trackHref } from "@/lib/utils/format";
import type { Locale } from "@/i18n/routing";
import type { Track, SimilarFilters } from "@/lib/cosine/types";

type Params = Promise<{ locale: Locale; id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseFilters(raw: Record<string, string | string[] | undefined>): SimilarFilters {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (typeof v === "string" && v !== "") flat[key] = v;
  }
  const parsed = similarFiltersSchema.safeParse(flat);
  return parsed.success ? parsed.data : {};
}

async function fetchTrack(id: string): Promise<Track | null> {
  try {
    const res = await getTrack(id);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const track = await fetchTrack(id);

  if (!track) {
    return { title: t("homeTitle"), description: t("homeDescription") };
  }

  const { artist, title } = artistAndTitle(track);
  const metaTitle = t("trackTitle", { title, artist });
  const description = t("trackDescription", { artist, title });

  return {
    title: metaTitle,
    description,
    openGraph: {
      type: "music.song",
      title: metaTitle,
      description,
      ...(track.external_link ? { url: track.external_link } : {}),
    },
    twitter: { card: "summary_large_image", title: metaTitle, description },
  };
}

export default async function TrackPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "track" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const track = await fetchTrack(id);

  if (!track) {
    return (
      <Container className="py-16 sm:py-24" as="section">
        <EmptyState
          title={t("notFoundTitle")}
          description={t("notFoundBody")}
          action={
            <Link href="/" className={buttonClasses({ variant: "primary", size: "md" })}>
              {t("backToSearch")}
            </Link>
          }
        />
      </Container>
    );
  }

  const { artist, title } = artistAndTitle(track);
  const initialFilters = parseFilters(await searchParams);
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const trackUrl = `${SITE_URL}${locale === "en" ? "/en" : ""}${trackHref(track.id)}`;
  const home = `${SITE_URL}${locale === "en" ? "/en" : ""}`;

  return (
    <Container className="py-10 sm:py-14" as="article">
      <TrackJsonLd track={track} nonce={nonce} />
      <BreadcrumbJsonLd
        items={[
          { name: "Dallacks", url: home },
          { name: title, url: trackUrl },
        ]}
        nonce={nonce}
      />

      <header className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            {t("sourceTrack")}
          </p>

          <h1 className="font-display text-4xl leading-[1.05] text-balance text-fg sm:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-muted">{artist}</p>

          <div className="flex flex-wrap items-center gap-3">
            {track.source ? <Badge variant="outline">{track.source}</Badge> : null}

            {track.external_link ? (
              <a
                href={track.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                {t("viewExternal", { source: track.source ?? tc("source") })}
                <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
                  <path
                    d="M7 17 17 7M9 7h8v8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ) : null}

            <ShareButton
              url={trackUrl}
              title={`${title} — ${artist}`}
              label={tc("share")}
              copiedMessage={tc("linkCopied")}
            />
          </div>
        </div>

        {track.video_uri || track.video_id ? (
          <div className="w-full lg:max-w-md">
            <YoutubeEmbed videoUri={track.video_uri} videoId={track.video_id} title={track.name} />
          </div>
        ) : null}
      </header>

      <hr className="my-10 border-border sm:my-14" />

      <SimilarSection trackId={track.id} initialFilters={initialFilters} sourceName={track.name} />
    </Container>
  );
}
