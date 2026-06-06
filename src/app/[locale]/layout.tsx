import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { clashDisplay, satoshi } from "@/lib/fonts";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { PlayerProvider } from "@/providers/player-provider";
import { SkipLink } from "@/components/layout/skip-link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "../globals.css";

import { SITE_URL as siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("homeTitle"), template: "%s — Dallacks" },
    description: t("homeDescription"),
    applicationName: "Dallacks",
    alternates: {
      canonical: locale === "es" ? "/" : "/en",
      languages: { es: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "Dallacks",
      locale: locale === "es" ? "es_AR" : "en_US",
      title: t("homeTitle"),
      description: t("homeDescription"),
    },
    twitter: { card: "summary_large_image", title: t("homeTitle"), description: t("homeDescription") },
    robots: { index: true, follow: true },
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Dallacks" },
    icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={`${satoshi.variable} ${clashDisplay.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col bg-bg text-fg antialiased" suppressHydrationWarning>
        <NextIntlClientProvider>
          <SkipLink label={t("skipToContent")} />
          <QueryProvider>
            <ToastProvider>
              <PlayerProvider>
                <Header />
                <main id="main" className="flex-1">
                  {children}
                </main>
                <Footer />
              </PlayerProvider>
            </ToastProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
