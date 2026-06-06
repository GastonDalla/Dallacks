import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/layout/container";
import { BulkSearch } from "@/components/bulk/bulk-search";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
  return {
    title: { absolute: t("bulkTitle") },
    description: t("bulkDescription"),
  };
}

export default async function BulkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale: locale as Locale, namespace: "bulk" });

  return (
    <Container as="section" className="flex flex-col gap-10 py-12 sm:py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl text-balance text-fg sm:text-4xl">{t("title")}</h1>
        <p className="max-w-prose text-muted text-balance">{t("subtitle")}</p>
      </header>

      <BulkSearch />
    </Container>
  );
}
