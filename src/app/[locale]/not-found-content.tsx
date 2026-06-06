"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { buttonClasses } from "@/components/ui/button";

export function NotFoundContent() {
  const t = useTranslations("errors");
  const tTrack = useTranslations("track");

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p
        aria-hidden="true"
        className="font-display text-7xl font-semibold leading-none tracking-tight text-fg sm:text-8xl"
      >
        4<span className="italic text-accent">0</span>4
      </p>
      <h1 className="mt-6 font-display text-2xl text-fg sm:text-3xl">{t("notFound")}</h1>
      <p className="mt-3 max-w-prose text-muted text-balance">{tTrack("notFoundBody")}</p>
      <Link href="/" className={buttonClasses({ variant: "primary", size: "lg", className: "mt-8" })}>
        {tTrack("backToSearch")}
      </Link>
    </Container>
  );
}
