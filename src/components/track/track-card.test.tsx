import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import type { AnchorHTMLAttributes, ReactElement } from "react";
import { renderWithProviders, screen } from "@/test/render";
import messages from "../../../messages/es.json";
import { sourceTrack, similarTracks } from "@/test/fixtures";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

import { TrackCard } from "./track-card";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("TrackCard", () => {
  it("renders the artist and title", () => {
    const track = similarTracks[0]!;
    renderWithProviders(withIntl(<TrackCard track={track} />));
    expect(screen.getByText(track.artist)).toBeInTheDocument();
    expect(screen.getByText(track.track)).toBeInTheDocument();
  });

  it("links the card title to the track detail href", () => {
    const track = similarTracks[0]!;
    renderWithProviders(withIntl(<TrackCard track={track} />));
    const link = screen.getByRole("link", { name: new RegExp(track.track, "i") });
    expect(link).toHaveAttribute("href", expect.stringContaining(`/track/${track.id}`));
  });

  it("shows the similarity score when present", () => {
    const track = similarTracks[0]!;
    renderWithProviders(withIntl(<TrackCard track={track} />));
    expect(screen.getByText("87%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("does not render a score bar when the track has no score", () => {
    renderWithProviders(withIntl(<TrackCard track={sourceTrack} />));
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("renders an external link when external_link is present", () => {
    const track = similarTracks[0]!;
    renderWithProviders(withIntl(<TrackCard track={track} />));
    const external = screen.getByRole("link", { name: /Discogs/i });
    expect(external).toHaveAttribute("href", track.external_link);
  });
});
