import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import type { AnchorHTMLAttributes, ReactElement } from "react";
import { renderWithProviders, screen, waitFor } from "@/test/render";
import { server } from "@/test/server";
import { sourceTrack, similarTracks } from "@/test/fixtures";
import messages from "../../../messages/es.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

import { SimilarGrid } from "./similar-grid";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("SimilarGrid", () => {
  it("renders a card for each similar track returned by the API", async () => {
    server.use(
      http.get("/api/tracks/:id/similar", () =>
        HttpResponse.json({
          ok: true,
          data: { source_track: sourceTrack, similar_tracks: similarTracks },
          meta: {},
        }),
      ),
    );

    renderWithProviders(withIntl(<SimilarGrid trackId={sourceTrack.id} />));

    await waitFor(() => {
      expect(screen.getByText(similarTracks[0]!.track)).toBeInTheDocument();
    });
    expect(screen.getByText(similarTracks[1]!.track)).toBeInTheDocument();
  });

  it("shows an empty state when there are no similar tracks", async () => {
    server.use(
      http.get("/api/tracks/:id/similar", () =>
        HttpResponse.json({
          ok: true,
          data: { source_track: sourceTrack, similar_tracks: [] },
          meta: {},
        }),
      ),
    );

    renderWithProviders(withIntl(<SimilarGrid trackId={sourceTrack.id} />));

    await waitFor(() => {
      expect(screen.getByText(messages.common.noResults)).toBeInTheDocument();
    });
  });

  it("shows an error state with a retry control when the request fails", async () => {
    server.use(
      http.get("/api/tracks/:id/similar", () =>
        HttpResponse.json(
          { ok: false, error: { code: "HTTP_ERROR", message: "boom", status: 500 } },
          { status: 500 },
        ),
      ),
    );

    renderWithProviders(withIntl(<SimilarGrid trackId={sourceTrack.id} />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: messages.common.retry })).toBeInTheDocument();
    });
  });

  it("renders pagination when the API reports more than one page", async () => {
    server.use(
      http.get("/api/tracks/:id/similar", () =>
        HttpResponse.json({
          ok: true,
          data: { source_track: sourceTrack, similar_tracks: similarTracks },
          meta: { pagination: { current_page: 1, total_pages: 3 } },
        }),
      ),
    );

    renderWithProviders(withIntl(<SimilarGrid trackId={sourceTrack.id} />));

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: messages.common.page })).toBeInTheDocument();
    });
  });
});
