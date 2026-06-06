"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { parseYouTubeId } from "@/lib/utils/url";

export interface YoutubeEmbedProps {
  videoUri?: string | null;
  videoId?: string | null;
  title: string;
  className?: string;
}

export function YoutubeEmbed({ videoUri, videoId, title, className }: YoutubeEmbedProps) {
  const t = useTranslations("track");
  const [playing, setPlaying] = useState(false);

  const id = parseYouTubeId(videoUri ?? videoId ?? null);
  if (!id) return null;

  const wrapper = cn(
    "relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black",
    className,
  );

  if (playing) {
    return (
      <div className={wrapper}>
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          loading="lazy"
          allow="accelerated-sensors; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={t("listenOnYoutube")}
      className={cn(
        wrapper,
        "group cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
      )}
    >
      <Image
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" aria-hidden="true" />
      <span
        className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-accent text-on-accent shadow-glow transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 translate-x-0.5">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
