import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import type { AnchorHTMLAttributes, ReactElement } from "react";
import { renderWithProviders, screen } from "@/test/render";
import messages from "../../../messages/es.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { NotFoundContent } from "./not-found-content";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("NotFoundContent", () => {
  it("renders the decorative 404 glyph", () => {
    renderWithProviders(withIntl(<NotFoundContent />));
    expect(screen.getByText((_, el) => el?.textContent === "404")).toBeInTheDocument();
  });

  it("uses the localized not-found message as the accessible heading", () => {
    renderWithProviders(withIntl(<NotFoundContent />));
    expect(screen.getByRole("heading", { name: messages.errors.notFound })).toBeInTheDocument();
  });

  it("renders a link back to the home page", () => {
    renderWithProviders(withIntl(<NotFoundContent />));
    const link = screen.getByRole("link", { name: messages.track.backToSearch });
    expect(link).toHaveAttribute("href", "/");
  });
});
