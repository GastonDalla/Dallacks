"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "./container";
import { Logo } from "./logo";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav = [
    { href: "/", label: t("discover") },
    { href: "/bulk", label: t("bulk") },
  ] as const;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Container className="flex h-16 items-center justify-between gap-3">
        <Logo />
        <nav aria-label={t("discover")} className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "hidden rounded-pill px-3 py-2 text-sm font-medium transition-colors sm:inline-block",
                isActive(item.href) ? "text-accent" : "text-muted hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
          <LocaleSwitcher />
        </nav>
      </Container>
    </header>
  );
}
