import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/layout/container";
import { GlowBackground } from "@/components/layout/glow-background";
import { Marquee } from "@/components/layout/marquee";
import { SearchPanel } from "@/components/search/search-panel";
import { HowItWorks } from "@/components/home/how-it-works";
import { WebsiteJsonLd } from "@/components/seo/website-jsonld";

function SearchGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function WaveformGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M4 12v0" />
      <path d="M8 8v8" />
      <path d="M12 5v14" />
      <path d="M16 8v8" />
      <path d="M20 11v2" />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-5"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.29-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale: locale as Locale, namespace: "home" });
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const steps = [
    { title: t("step1Title"), description: t("step1Desc"), icon: <SearchGlyph /> },
    { title: t("step2Title"), description: t("step2Desc"), icon: <WaveformGlyph /> },
    { title: t("step3Title"), description: t("step3Desc"), icon: <PlayGlyph /> },
  ];

  return (
    <>
      <WebsiteJsonLd nonce={nonce} />
      <section className="relative overflow-hidden">
        <GlowBackground />
        <Container className="flex flex-col items-center pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            {t("kicker")}
          </p>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {t("titleLead")}{" "}
            <span className="italic text-accent pr-[0.14em]">{t("titleAccent")}</span>{" "}
            {t("titleTail")}
          </h1>

          <p className="mt-6 max-w-2xl text-base text-balance text-muted sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-10 w-full sm:mt-12">
            <SearchPanel />
          </div>

          <HowItWorks heading={t("howItWorks")} steps={steps} className="mt-16 sm:mt-20" />
        </Container>
      </section>

      <Marquee text={t("marquee")} />
    </>
  );
}
