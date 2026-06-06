import { describe, expect, it, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import type { AnchorHTMLAttributes, ReactElement } from "react";
import { renderWithProviders, screen, userEvent, waitFor, within } from "@/test/render";
import { server } from "@/test/server";
import { sourceTrack, similarTracks } from "@/test/fixtures";
import messages from "../../../../../messages/es.json";

const replace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/track/185450",
}));

import { SimilarSection } from "./similar-section";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

function stubSimilar() {
  server.use(
    http.get("/api/tracks/:id/similar", () =>
      HttpResponse.json({
        ok: true,
        data: { source_track: sourceTrack, similar_tracks: similarTracks },
        meta: { pagination: { current_page: 1, total_pages: 3 } },
      }),
    ),
  );
}

describe("SimilarSection", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("renders the filters panel and the similar grid for the given track", async () => {
    stubSimilar();
    renderWithProviders(
      withIntl(<SimilarSection trackId={sourceTrack.id} initialFilters={{}} sourceName={sourceTrack.name} />),
    );

    expect(screen.getByText(messages.filters.title)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(similarTracks[0]!.track)).toBeInTheDocument();
    });
  });

  it("syncs filter changes to the URL via router.replace", async () => {
    stubSimilar();
    const user = userEvent.setup();
    renderWithProviders(
      withIntl(<SimilarSection trackId={sourceTrack.id} initialFilters={{}} sourceName={sourceTrack.name} />),
    );

    const yearFrom = screen.getByLabelText(messages.filters.yearFrom);
    await user.type(yearFrom, "1995");

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
    });
    const lastArg = replace.mock.calls.at(-1)?.[0] as string;
    expect(lastArg).toContain("start_year=1995");
  });

  it("changing the page syncs page to the URL", async () => {
    stubSimilar();
    const user = userEvent.setup();
    renderWithProviders(
      withIntl(<SimilarSection trackId={sourceTrack.id} initialFilters={{}} sourceName={sourceTrack.name} />),
    );

    const nav = await screen.findByRole("navigation", { name: messages.common.page });
    const nextBtn = within(nav).getByRole("button", { name: messages.common.next });
    await user.click(nextBtn);

    await waitFor(() => {
      const lastArg = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastArg).toContain("page=2");
    });
  });

  it("reset clears filters from the URL", async () => {
    stubSimilar();
    const user = userEvent.setup();
    renderWithProviders(
      withIntl(
        <SimilarSection
          trackId={sourceTrack.id}
          initialFilters={{ start_year: 1995 }}
          sourceName={sourceTrack.name}
        />,
      ),
    );

    await user.click(screen.getByRole("button", { name: messages.filters.reset }));

    await waitFor(() => {
      const lastArg = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastArg).not.toContain("start_year");
    });
  });
});
