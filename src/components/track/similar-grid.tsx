"use client";

import { useTranslations } from "next-intl";
import { TrackCard } from "./track-card";
import { toPlayingTrack } from "./track-play-button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { usePlayer, type PlayingTrack } from "@/providers/player-provider";
import { useSimilar } from "@/lib/api/queries";
import { cn } from "@/lib/utils/cn";
import type { SimilarFilters } from "@/lib/cosine/types";

export interface SimilarGridProps {
  trackId: string;
  filters?: SimilarFilters;
  sourceName?: string;
  onPageChange?: (page: number) => void;
  className?: string;
}

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function SimilarGrid({
  trackId,
  filters = {},
  sourceName,
  onPageChange,
  className,
}: SimilarGridProps) {
  const t = useTranslations("track");
  const tc = useTranslations("common");
  const tErr = useTranslations("errors");
  const player = usePlayer();

  const query = useSimilar(trackId, filters);
  const data = query.data?.data;
  const tracks = data?.similar_tracks ?? [];
  const pagination = query.data?.meta?.pagination;
  const sourceTrackName = sourceName ?? data?.source_track.name;

  const queue: PlayingTrack[] = [];
  const queueIndexById = new Map<string, number>();
  for (const track of tracks) {
    const item = toPlayingTrack(track);
    if (item) {
      queueIndexById.set(track.id, queue.length);
      queue.push(item);
    }
  }

  return (
    <section className={cn("flex flex-col gap-6", className)} aria-busy={query.isFetching || undefined}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl text-fg sm:text-3xl">{t("similarTitle")}</h2>
          {sourceTrackName ? (
            <p className="text-sm text-muted">
              {t("similarSubtitle")} <span className="text-fg">{sourceTrackName}</span>
            </p>
          ) : null}
        </div>

        {queue.length > 0 ? (
          <Button variant="primary" size="sm" onClick={() => player.playQueue(queue, 0)}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
              <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
            </svg>
            {t("playAll")}
          </Button>
        ) : null}
      </header>

      {query.isPending ? (
        <>
          <span className="sr-only" role="status">
            {tc("loading")}
          </span>
          <div className={GRID} aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        </>
      ) : query.isError ? (
        <EmptyState
          title={tErr("generic")}
          description={tErr("tryAgain")}
          action={
            <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
              {tc("retry")}
            </Button>
          }
        />
      ) : tracks.length === 0 ? (
        <EmptyState title={tc("noResults")} />
      ) : (
        <>
          <div className={GRID}>
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                queue={queue}
                queueIndex={queueIndexById.get(track.id)}
              />
            ))}
          </div>

          {pagination && (pagination.total_pages ?? 1) > 1 ? (
            <Pagination
              page={pagination.current_page ?? filters.page ?? 1}
              totalPages={pagination.total_pages ?? 1}
              onPageChange={(page) => onPageChange?.(page)}
              label={tc("page")}
              labelPrevious={tc("previous")}
              labelNext={tc("next")}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
