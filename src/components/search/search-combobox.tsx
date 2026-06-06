"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { api, ApiClientError } from "@/lib/api/client";
import { useSearchSuggestions } from "@/lib/api/queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useToast } from "@/providers/toast-provider";
import { artistAndTitle, trackHref } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import type { Track } from "@/lib/cosine/types";
import type { SearchMode } from "./search-mode-toggle";

const SUPPORTED_HOSTS = [
  "discogs.com",
  "youtube.com",
  "youtu.be",
  "music.youtube.com",
  "soundcloud.com",
];

function isSupportedUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  return SUPPORTED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`) || host.includes(h));
}

function errorKey(error: unknown): "network" | "rateLimited" | "notFound" | "unauthorized" | "generic" {
  if (error instanceof ApiClientError) {
    if (error.code === "NETWORK_ERROR" || error.status === 0) return "network";
    if (error.status === 429) return "rateLimited";
    if (error.status === 404) return "notFound";
    if (error.status === 401 || error.status === 403) return "unauthorized";
  }
  return "generic";
}

export interface SearchComboboxProps {
  mode: SearchMode;
  className?: string;
}

const FIELD =
  "w-full rounded-2xl border border-border bg-surface px-5 text-base text-fg placeholder:text-faint " +
  "h-14 outline-none transition-colors " +
  "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40";

export function SearchCombobox({ mode, className }: SearchComboboxProps) {
  return mode === "name" ? (
    <NameCombobox className={className} />
  ) : (
    <LinkLookup className={className} />
  );
}

function NameCombobox({ className }: { className?: string }) {
  const t = useTranslations("search");
  const router = useRouter();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const labelId = `${baseId}-label`;

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndexRaw, setActiveIndex] = useState(-1);

  const debounced = useDebouncedValue(value, 250);
  const { data, isFetching } = useSearchSuggestions(debounced);
  const options = useMemo<Track[]>(() => data ?? [], [data]);

  const hasQuery = debounced.trim().length >= 2;
  const showEmpty = open && hasQuery && !isFetching && options.length === 0;
  const showListbox = open && options.length > 0;

  const activeIndex = activeIndexRaw >= options.length ? options.length - 1 : activeIndexRaw;

  const optionId = useCallback((index: number) => `${baseId}-option-${index}`, [baseId]);

  const selectOption = useCallback(
    (track: Track | undefined) => {
      if (!track) return;
      setOpen(false);
      router.push(trackHref(track.id));
    },
    [router],
  );

  function move(delta: number) {
    if (options.length === 0) return;
    setOpen(true);
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return options.length - 1;
      if (next >= options.length) return 0;
      return next;
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        if (options.length > 0) {
          event.preventDefault();
          setOpen(true);
          setActiveIndex(0);
        }
        break;
      case "End":
        if (options.length > 0) {
          event.preventDefault();
          setOpen(true);
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
        if (open && activeIndex >= 0) {
          event.preventDefault();
          selectOption(options[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
        }
        break;
      default:
        break;
    }
  }

  const activeDescendant =
    showListbox && activeIndex >= 0 ? optionId(activeIndex) : undefined;

  return (
    <div className={cn("relative w-full", className)}>
      <label id={labelId} htmlFor={`${baseId}-input`} className="sr-only">
        {t("label")}
      </label>

      <div className="relative">
        <input
          id={`${baseId}-input`}
          role="combobox"
          type="text"
          autoComplete="off"
          aria-labelledby={labelId}
          aria-expanded={showListbox}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          placeholder={t("placeholderName")}
          value={value}
          className={cn(FIELD, "pr-12")}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (options.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {isFetching && hasQuery ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">
            <Spinner size="sm" label={t("searching")} />
          </span>
        ) : null}
      </div>

      {showListbox ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={t("label")}
          className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-border bg-surface-2 p-1.5 shadow-glow"
        >
          {options.map((track, index) => {
            const { artist, title } = artistAndTitle(track);
            const isActive = index === activeIndex;
            return (
              <li
                key={track.id}
                id={optionId(index)}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => selectOption(track)}
                className={cn(
                  "flex cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors",
                  isActive ? "bg-accent/15 text-fg" : "text-muted hover:text-fg",
                )}
              >
                <span className="truncate text-sm font-medium text-fg">{title}</span>
                <span className="truncate text-xs text-muted">{artist}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {showEmpty ? (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border bg-surface-2 px-4 py-6 text-center text-sm text-muted shadow-glow">
          {t("noResults", { query: debounced.trim() })}
        </div>
      ) : null}

      <span className="sr-only" role="status" aria-live="polite">
        {showListbox || showEmpty
          ? t("resultsAnnounce", { count: options.length })
          : ""}
      </span>
    </div>
  );
}

function LinkLookup({ className }: { className?: string }) {
  const t = useTranslations("search");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const { toast } = useToast();
  const baseId = useId();
  const errorId = `${baseId}-error`;
  const resultsId = `${baseId}-results`;

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Track[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResults(null);

    const url = value.trim();
    if (!isSupportedUrl(url)) {
      setError(t("invalidUrl"));
      return;
    }

    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;
    setLoading(true);
    try {
      const { data } = await api.lookup(url, controller.signal);
      if (data.length === 1) {
        router.push(trackHref(data[0]!.id));
      } else if (data.length > 1) {
        setResults(data);
      } else {
        setError(t("noResultsLink"));
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      toast(tErrors(errorKey(err)), "error");
    } finally {
      if (inFlight.current === controller) {
        setLoading(false);
        inFlight.current = null;
      }
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`${baseId}-input`} className="sr-only">
            {t("label")}
          </label>
          <input
            id={`${baseId}-input`}
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder={t("placeholderLink")}
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            className={cn(
              FIELD,
              error && "border-danger focus-visible:border-danger focus-visible:ring-danger/40",
            )}
          />
        </div>
        <Button type="submit" size="lg" disabled={loading} className="shrink-0">
          {loading ? <Spinner size="sm" label={t("searching")} /> : null}
          {t("lookupSubmit")}
        </Button>
      </form>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {results ? (
        <ul
          id={resultsId}
          role="listbox"
          aria-label={t("label")}
          className="mt-4 flex flex-col gap-1.5 rounded-2xl border border-border bg-surface-2 p-1.5"
        >
          {results.map((track) => {
            const { artist, title } = artistAndTitle(track);
            return (
              <li
                key={track.id}
                role="option"
                tabIndex={0}
                aria-selected={false}
                onClick={() => router.push(trackHref(track.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(trackHref(track.id));
                  }
                }}
                className="flex cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left text-muted transition-colors hover:bg-accent/15 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <span className="truncate text-sm font-medium text-fg">{title}</span>
                <span className="truncate text-xs text-muted">{artist}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
