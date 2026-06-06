import { getTranslations } from "next-intl/server";
import { Container } from "./container";
import { Logo } from "./logo";
import { Link } from "@/i18n/navigation";

const OTHER_PROJECT_URL = "https://vinyls.gastondalla.com";

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = String(new Date().getFullYear());

  const links = [
    { href: "/", label: nav("discover") },
    { href: "/bulk", label: nav("bulk") },
  ] as const;

  return (
    <footer className="mt-24 border-t border-border/60">
      <Container className="flex flex-col gap-10 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs space-y-3">
          <Logo />
          <p className="text-sm text-muted">{t("tagline")}</p>
        </div>

        <nav aria-label={t("explore")} className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-faint">{t("explore")}</p>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-fit text-sm text-muted transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>

      <div className="border-t border-border/40">
        <Container className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-faint">{t("rights", { year })}</p>
          <p className="text-xs text-faint">
            {t("otherProject")}:{" "}
            <a
              href={OTHER_PROJECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              Dallateas
            </a>{" "}
            <span className="text-faint">— {t("otherProjectDesc")}</span>
          </p>
        </Container>
      </div>
    </footer>
  );
}
