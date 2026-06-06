import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import messages from "../../../messages/es.json";

import { ErrorContent } from "./error-content";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("ErrorContent", () => {
  it("shows the generic error message", () => {
    renderWithProviders(withIntl(<ErrorContent reset={vi.fn()} />));
    expect(screen.getByText(messages.errors.generic)).toBeInTheDocument();
  });

  it("exposes an alert region for assistive tech", () => {
    renderWithProviders(withIntl(<ErrorContent reset={vi.fn()} />));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("invokes reset when the retry button is pressed", async () => {
    const reset = vi.fn();
    renderWithProviders(withIntl(<ErrorContent reset={reset} />));
    await userEvent.click(screen.getByRole("button", { name: messages.errors.tryAgain }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
