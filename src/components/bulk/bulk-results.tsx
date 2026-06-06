"use client";

import { useTranslations } from "next-intl";
import type { BulkData } from "@/lib/cosine/types";
import { TrackCard } from "@/components/track/track-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export interface BulkResultsProps {
  data: BulkData;
}

export function BulkResults({ data }: BulkResultsProps) {
  const t = useTranslations("bulk");
  const tCommon = useTranslations("common");
  const { results, unmatched } = data;

  if (results.length === 0 && unmatched.length === 0) {
    return <EmptyState title={t("empty")} />;
  }

  return (
    <div className="flex flex-col gap-10">
      {results.length > 0 ? (
        <section aria-labelledby="bulk-matched-heading" className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <h2 id="bulk-matched-heading" className="font-display text-xl text-fg">
              {t("matched")}
            </h2>
            <Badge variant="accent">{results.length}</Badge>
          </div>

          <ol className="flex list-none flex-col gap-10">
            {results.map((group, index) => (
              <li key={`${group.query}-${index}`} className="flex flex-col gap-4">
                <header className="flex flex-col gap-1">
                  <p className="text-sm text-muted">{group.query}</p>
                  <h3 className="font-display text-lg text-fg">
                    {group.track.artist} — {group.track.track}
                  </h3>
                </header>

                {group.similar_tracks.length > 0 ? (
                  <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.similar_tracks.map((track) => (
                      <li key={track.id}>
                        <TrackCard track={track} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">{tCommon("noResults")}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {unmatched.length > 0 ? (
        <section aria-labelledby="bulk-unmatched-heading" className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 id="bulk-unmatched-heading" className="font-display text-lg text-muted">
              {t("unmatched")}
            </h2>
            <Badge variant="outline">{unmatched.length}</Badge>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm text-faint">
            {unmatched.map((query, index) => (
              <li key={`${query}-${index}`}>{query}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
