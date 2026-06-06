"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function ErrorContent({ reset }: { reset: () => void }) {
  const t = useTranslations("errors");

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p
        aria-hidden="true"
        className="font-display text-7xl font-semibold leading-none tracking-tight text-fg sm:text-8xl"
      >
        <span className="italic text-accent">!</span>
      </p>
      <div role="alert" className="mt-6 space-y-3">
        <h1 className="font-display text-2xl text-fg sm:text-3xl">{t("generic")}</h1>
        <p className="max-w-prose text-muted text-balance">{t("network")}</p>
      </div>
      <Button variant="primary" size="lg" className="mt-8" onClick={reset}>
        {t("tryAgain")}
      </Button>
    </Container>
  );
}
