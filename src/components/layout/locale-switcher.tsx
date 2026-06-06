"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const active = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === active) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error
        { pathname, params },
        { locale: next },
      );
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex items-center rounded-pill border border-border bg-surface p-0.5",
        isPending && "opacity-60",
      )}
    >
      {routing.locales.map((loc) => {
        const isActive = loc === active;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            aria-pressed={isActive}
            disabled={isPending}
            className={cn(
              "rounded-pill px-2.5 py-1 text-xs font-semibold uppercase transition-colors",
              isActive ? "bg-accent text-on-accent" : "text-muted hover:text-fg",
            )}
          >
            {t(loc)}
          </button>
        );
      })}
    </div>
  );
}
