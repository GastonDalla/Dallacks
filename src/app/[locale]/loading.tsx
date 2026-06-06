import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Loading() {
  const t = await getTranslations("common");

  return (
    <Container className="py-16 sm:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-4 w-28 rounded-pill" />
        <Skeleton className="h-12 w-full max-w-2xl sm:h-16" />
        <Skeleton className="h-12 w-3/4 max-w-xl sm:h-16" />
        <Skeleton className="mt-2 h-5 w-full max-w-md" />
      </div>

      <div className="mt-16 flex items-center justify-center">
        <Spinner size="md" label={t("loading")} className="text-accent" />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <Skeleton className="mt-6 h-2 w-full rounded-pill" />
          </div>
        ))}
      </div>
    </Container>
  );
}
