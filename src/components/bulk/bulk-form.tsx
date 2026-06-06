"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { api, ApiClientError } from "@/lib/api/client";
import type { BulkData } from "@/lib/cosine/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/providers/toast-provider";

const MAX_TRACKS = 50;
const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

export interface BulkFormProps {
  onResults?: (data: BulkData) => void;
}

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function errorKey(error: unknown): "network" | "rateLimited" | "notFound" | "unauthorized" | "generic" {
  if (error instanceof ApiClientError) {
    if (error.status === 0 || error.code === "NETWORK_ERROR") return "network";
    if (error.status === 429) return "rateLimited";
    if (error.status === 404) return "notFound";
    if (error.status === 401 || error.status === 403) return "unauthorized";
  }
  return "generic";
}

export function BulkForm({ onResults }: BulkFormProps) {
  const t = useTranslations("bulk");
  const tErrors = useTranslations("errors");
  const { toast } = useToast();

  const [raw, setRaw] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [validationError, setValidationError] = useState<string | null>(null);

  const limitId = useId();
  const lines = useMemo(() => parseLines(raw), [raw]);

  const mutation = useMutation({
    mutationFn: (tracks: string[]) =>
      api.bulk({ tracks, similar_limit: limit }).then((res) => res.data),
    onSuccess: (data) => {
      setValidationError(null);
      onResults?.(data);
    },
    onError: (error) => {
      toast(tErrors(errorKey(error)), "error");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lines.length === 0) {
      setValidationError(t("empty"));
      return;
    }
    if (lines.length > MAX_TRACKS) {
      setValidationError(t("tooMany"));
      return;
    }
    setValidationError(null);
    mutation.mutate(lines);
  }

  const overLimit = lines.length > MAX_TRACKS;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Textarea
        label={t("title")}
        placeholder={t("placeholder")}
        hint={t("countHint", { count: lines.length })}
        error={validationError ?? undefined}
        value={raw}
        onChange={(event) => {
          setRaw(event.target.value);
          if (validationError) setValidationError(null);
        }}
        rows={8}
        className="font-sans min-h-44"
        aria-invalid={overLimit || undefined}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-44">
          <Input
            id={limitId}
            type="number"
            label={t("similarLimit")}
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            value={limit}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isNaN(next)) return;
              setLimit(Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.trunc(next))));
            }}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending || undefined}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? t("running") : t("run")}
        </Button>
      </div>
    </form>
  );
}
