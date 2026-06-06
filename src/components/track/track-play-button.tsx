"use client";

import { useTranslations } from "next-intl";
import { usePlayer, type PlayingTrack } from "@/providers/player-provider";
import { parseYouTubeId } from "@/lib/utils/url";
import { artistAndTitle } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Track } from "@/lib/cosine/types";

export function toPlayingTrack(track: Track): PlayingTrack | null {
  const videoId = parseYouTubeId(track.video_uri ?? track.video_id);
  if (!videoId) return null;
  const { artist, title } = artistAndTitle(track);
  return { videoId, title, artist };
}

export interface TrackPlayButtonProps {
  track: Track;
  queue?: PlayingTrack[];
  index?: number;
  className?: string;
}

export function TrackPlayButton({ track, queue, index, className }: TrackPlayButtonProps) {
  const t = useTranslations("common");
  const player = usePlayer();
  const item = toPlayingTrack(track);
  if (!item) return null;

  const isCurrent = player.current?.videoId === item.videoId;

  const handleClick = () => {
    if (queue && queue.length > 0 && typeof index === "number") player.playQueue(queue, index);
    else player.play(item);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isCurrent}
      aria-label={`${t("listen")}: ${item.artist} — ${item.title}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
        isCurrent
          ? "bg-accent text-on-accent"
          : "bg-surface-2 text-fg hover:bg-accent hover:text-on-accent",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
        <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
      </svg>
      {t("listen")}
    </button>
  );
}
