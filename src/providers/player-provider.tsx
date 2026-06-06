"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils/cn";

export interface PlayingTrack {
  videoId: string;
  title: string;
  artist: string;
}

interface PlayerContextValue {
  queue: PlayingTrack[];
  index: number;
  current: PlayingTrack | null;
  playQueue: (tracks: PlayingTrack[], startIndex?: number) => void;
  play: (track: PlayingTrack) => void;
  next: () => void;
  previous: () => void;
  jumpTo: (i: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextValue>({
  queue: [],
  index: -1,
  current: null,
  playQueue: () => {},
  play: () => {},
  next: () => {},
  previous: () => {},
  jumpTo: () => {},
  close: () => {},
});

export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<PlayingTrack[]>([]);
  const [index, setIndex] = useState(-1);

  const current = index >= 0 && index < queue.length ? queue[index]! : null;

  const playQueue = useCallback((tracks: PlayingTrack[], startIndex = 0) => {
    setQueue(tracks);
    setIndex(tracks.length ? Math.min(Math.max(0, startIndex), tracks.length - 1) : -1);
  }, []);

  const play = useCallback((track: PlayingTrack) => {
    setQueue([track]);
    setIndex(0);
  }, []);

  const next = useCallback(
    () => setIndex((i) => (i >= 0 && i + 1 < queue.length ? i + 1 : -1)),
    [queue.length],
  );

  const previous = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : i)), []);

  const jumpTo = useCallback(
    (i: number) => setIndex((prev) => (i >= 0 && i < queue.length ? i : prev)),
    [queue.length],
  );

  const close = useCallback(() => {
    setIndex(-1);
    setQueue([]);
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      close();
    }
  }, [pathname, close]);

  useEffect(() => {
    document.body.style.paddingBottom = current
      ? "calc(7.5rem + env(safe-area-inset-bottom))"
      : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [current]);

  return (
    <PlayerContext.Provider
      value={{ queue, index, current, playQueue, play, next, previous, jumpTo, close }}
    >
      {children}
      <MiniPlayer
        queue={queue}
        current={current}
        index={index}
        total={queue.length}
        onNext={next}
        onPrevious={previous}
        onJumpTo={jumpTo}
        onClose={close}
      />
    </PlayerContext.Provider>
  );
}

let apiPromise: Promise<typeof YT> | null = null;

function loadYouTubeApi(): Promise<typeof YT> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<typeof YT>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

interface MiniPlayerProps {
  queue: PlayingTrack[];
  current: PlayingTrack | null;
  index: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
  onJumpTo: (i: number) => void;
  onClose: () => void;
}

function MiniPlayer({
  queue,
  current,
  index,
  total,
  onNext,
  onPrevious,
  onJumpTo,
  onClose,
}: MiniPlayerProps) {
  const t = useTranslations("common");
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);

  const onNextRef = useRef(onNext);
  const onPreviousRef = useRef(onPrevious);
  useEffect(() => {
    onNextRef.current = onNext;
    onPreviousRef.current = onPrevious;
  }, [onNext, onPrevious]);

  const videoId = current?.videoId ?? null;
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    void loadYouTubeApi().then((api) => {
      if (cancelled || !hostRef.current) return;
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }
      playerRef.current = new api.Player(hostRef.current, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            setVolume(e.target.getVolume?.() ?? 100);
            setIsMuted(e.target.isMuted?.() ?? false);
          },
          onStateChange: (e) => {
            if (e.data === api.PlayerState.ENDED) onNextRef.current();
            setIsPaused(e.data === api.PlayerState.PAUSED);
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    if (current) return;
    playerRef.current?.destroy();
    playerRef.current = null;
  }, [current]);

  useEffect(() => {
    if (!current) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (p && typeof p.getDuration === "function") {
        setProgress({ current: p.getCurrentTime?.() ?? 0, duration: p.getDuration() || 0 });
      }
    }, 250);
    return () => clearInterval(id);
  }, [current]);

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    if (isPausedRef.current) p.playVideo();
    else p.pauseVideo();
  }

  const seekBy = useCallback((delta: number) => {
    const p = playerRef.current;
    if (!p || typeof p.getCurrentTime !== "function") return;
    const duration = p.getDuration?.() ?? 0;
    const raw = (p.getCurrentTime() ?? 0) + delta;
    const target = Math.max(0, duration ? Math.min(raw, duration) : raw);
    p.seekTo(target, true);
    setProgress((prev) => ({ ...prev, current: target }));
  }, []);

  useEffect(() => {
    if (!current) return;
    function handleKey(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;
      switch (event.key) {
        case " ":
        case "Spacebar":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          if (event.shiftKey) {
            event.preventDefault();
            onNextRef.current();
          } else {
            event.preventDefault();
            seekBy(5);
          }
          break;
        case "ArrowLeft":
          if (event.shiftKey) {
            event.preventDefault();
            onPreviousRef.current();
          } else {
            event.preventDefault();
            seekBy(-5);
          }
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, seekBy]);

  function handleSeek(event: ChangeEvent<HTMLInputElement>) {
    const time = Number(event.target.value);
    setProgress((p) => ({ ...p, current: time }));
    playerRef.current?.seekTo(time, true);
  }

  function handleVolume(event: ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    const p = playerRef.current;
    setVolume(value);
    p?.setVolume(value);
    if (value === 0) {
      p?.mute();
      setIsMuted(true);
    } else if (isMuted) {
      p?.unMute();
      setIsMuted(false);
    }
  }

  function toggleMute() {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted?.()) {
      p.unMute();
      setIsMuted(false);
      const restored = p.getVolume?.() ?? volume;
      setVolume(restored > 0 ? restored : 100);
      if (restored <= 0) p.setVolume(100);
    } else {
      p.mute();
      setIsMuted(true);
    }
  }

  const queueRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!queueOpen && !shortcutsOpen) return;
    function handleOutside(event: MouseEvent) {
      if (queueRef.current && !queueRef.current.contains(event.target as Node)) {
        setQueueOpen(false);
        setShortcutsOpen(false);
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setQueueOpen(false);
        setShortcutsOpen(false);
      }
    }
    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [queueOpen, shortcutsOpen]);

  if (!current) return null;

  const hasQueue = total > 1;

  return (
    <div
      role="region"
      aria-label={t("listen")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      ref={queueRef}
    >
      {hasQueue && queueOpen ? (
        <div
          id="player-queue-panel"
          role="listbox"
          aria-label={t("queue")}
          className="mx-auto max-h-64 w-full max-w-6xl overflow-y-auto border-b border-border px-4 py-3 sm:px-8"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
            {t("upNext")}
          </p>
          <ul className="flex flex-col gap-0.5">
            {queue.map((track, i) => {
              const active = i === index;
              return (
                <li key={`${track.videoId}-${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onJumpTo(i);
                      setQueueOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                      active ? "bg-surface-2 text-accent" : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <span className="w-5 shrink-0 text-right text-xs tabular-nums text-faint">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      <span className={cn("font-medium", active ? "text-accent" : "text-fg")}>
                        {track.title}
                      </span>
                      <span className="text-muted"> — {track.artist}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {shortcutsOpen ? (
        <div className="mx-auto w-full max-w-6xl border-b border-border px-4 py-3 sm:px-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">{t("shortcuts")}</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex items-center gap-3">
              <kbd className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg">Space</kbd>
              <span className="text-muted">{t("shortcutPlay")}</span>
            </li>
            <li className="flex items-center gap-3">
              <kbd className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg">← →</kbd>
              <span className="text-muted">{t("shortcutSeek")}</span>
            </li>
            <li className="flex items-center gap-3">
              <kbd className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-fg">⇧ ← →</kbd>
              <span className="text-muted">{t("shortcutSkip")}</span>
            </li>
          </ul>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:flex-1">
          <div className="aspect-video w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-black sm:w-40 [&_iframe]:size-full">
            <div ref={hostRef} className="size-full" />
          </div>

          <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate font-medium text-fg">{current.title}</p>
            {hasQueue ? (
              <span className="shrink-0 text-xs text-faint tabular-nums">
                {index + 1} / {total}
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm text-muted">{current.artist}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-faint">
              {formatTime(progress.current)}
            </span>
            <input
              type="range"
              min={0}
              max={progress.duration || 0}
              value={Math.min(progress.current, progress.duration || 0)}
              onChange={handleSeek}
              aria-label={t("seek")}
              className="h-1.5 flex-1 cursor-pointer accent-accent"
            />
            <span className="w-9 shrink-0 text-[10px] tabular-nums text-faint">
              {formatTime(progress.duration)}
            </span>
          </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 sm:shrink-0 sm:justify-end">
          <div className="flex items-center gap-1.5 pr-1">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={t("mute")}
              aria-pressed={isMuted}
              className="grid size-9 place-items-center rounded-pill text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {isMuted || volume === 0 ? (
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={handleVolume}
              aria-label={t("volume")}
              className="h-1.5 w-16 cursor-pointer accent-accent sm:w-20"
            />
          </div>

          {hasQueue ? (
            <button
              type="button"
              onClick={() => {
                setQueueOpen((open) => !open);
                setShortcutsOpen(false);
              }}
              aria-label={t("queue")}
              aria-expanded={queueOpen}
              aria-controls="player-queue-panel"
              className={cn(
                "grid size-9 place-items-center rounded-pill transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
                queueOpen ? "bg-surface-2 text-accent" : "text-muted",
              )}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h13M3 12h13M3 18h9M17 14l4 3-4 3z" />
              </svg>
            </button>
          ) : null}

          {hasQueue ? (
            <button
              type="button"
              onClick={onPrevious}
              disabled={index <= 0}
              aria-label={t("previous")}
              className="hidden size-9 place-items-center rounded-pill text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 sm:grid"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                <path d="M7 6h2v12H7zM20 6v12l-9-6z" />
              </svg>
            </button>
          ) : null}

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPaused ? t("play") : t("pause")}
            className="grid size-10 place-items-center rounded-pill bg-accent text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {isPaused ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
              </svg>
            )}
          </button>

          {hasQueue ? (
            <button
              type="button"
              onClick={onNext}
              aria-label={t("next")}
              className="grid size-9 place-items-center rounded-pill text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                <path d="M15 6h2v12h-2zM4 6l9 6-9 6z" />
              </svg>
            </button>
          ) : null}

          <CopyButton
            value={`${current.artist} - ${current.title}`}
            label={t("copy")}
            copiedMessage={t("copied")}
            className="hidden size-9 sm:inline-flex"
          />

          <button
            type="button"
            onClick={() => {
              setShortcutsOpen((open) => !open);
              setQueueOpen(false);
            }}
            aria-label={t("shortcuts")}
            aria-expanded={shortcutsOpen}
            className={cn(
              "hidden size-9 place-items-center rounded-pill transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 sm:grid",
              shortcutsOpen ? "bg-surface-2 text-accent" : "text-muted",
            )}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="grid size-9 place-items-center rounded-pill text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
