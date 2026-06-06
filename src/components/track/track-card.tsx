"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { TrackPlayButton, toPlayingTrack } from "./track-play-button";
import { CopyButton } from "@/components/ui/copy-button";
import { usePlayer, type PlayingTrack } from "@/providers/player-provider";
import { cn } from "@/lib/utils/cn";
import { artistAndTitle, trackHref } from "@/lib/utils/format";
import type { Track } from "@/lib/cosine/types";

export interface TrackCardProps {
  track: Track;
  queue?: PlayingTrack[];
  queueIndex?: number;
  className?: string;
}

export function TrackCard({ track, queue, queueIndex, className }: TrackCardProps) {
  const t = useTranslations("track");
  const tc = useTranslations("common");
  const player = usePlayer();
  const { artist, title } = artistAndTitle(track);
  const hasScore = typeof track.score === "number";
  const item = toPlayingTrack(track);
  const isPlaying = item ? player.current?.videoId === item.videoId : false;

  return (
    <article
      aria-current={isPlaying ? "true" : undefined}
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border bg-surface p-5 transition-colors",
        isPlaying
          ? "border-accent ring-1 ring-accent/40 shadow-glow"
          : "border-border hover:border-accent/50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight text-fg">
            <Link
              href={trackHref(track.id)}
              className="transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-1 truncate text-sm text-muted">{artist}</p>
        </div>
        {track.source ? <Badge variant="outline">{track.source}</Badge> : null}
      </div>

      {hasScore ? <ScoreBar score={track.score as number} label={t("score")} /> : null}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <TrackPlayButton track={track} queue={queue} index={queueIndex} />
        <CopyButton value={track.name} label={tc("copy")} copiedMessage={tc("copied")} />

        {track.external_link ? (
          <a
            href={track.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {t("viewExternal", { source: track.source ?? tc("source") })}
          </a>
        ) : null}
      </div>
    </article>
  );
}
