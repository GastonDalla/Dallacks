import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";
import { server } from "@/test/server";
import { ToastProvider } from "@/providers/toast-provider";
import messages from "../../../messages/es.json";
import { sourceTrack, similarTracks } from "@/test/fixtures";
import type { BulkData } from "@/lib/cosine/types";
import { BulkForm } from "./bulk-form";

function withProviders(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      <ToastProvider>{ui}</ToastProvider>
    </NextIntlClientProvider>
  );
}

const placeholder = messages.bulk.placeholder;

function lines(count: number): string {
  return Array.from({ length: count }, (_, i) => `Artist ${i} - Track ${i}`).join("\n");
}

describe("BulkForm", () => {
  it("renders the textarea, similar-limit input and submit button", () => {
    renderWithProviders(withProviders(<BulkForm />));
    expect(screen.getByRole("textbox", { name: /lote|tracks/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /similares/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buscar en lote/i })).toBeInTheDocument();
  });

  it("shows a live count of non-empty lines", async () => {
    const user = userEvent.setup();
    renderWithProviders(withProviders(<BulkForm />));
    const textarea = screen.getByRole("textbox", { name: /lote|tracks/i });
    await user.click(textarea);
    await user.paste("Joy Orbison - Hyph Mngo\n\nJulio Bashmore - Battle For Middle You\n");
    expect(screen.getByText("2/50 tracks")).toBeInTheDocument();
  });

  it("shows the empty error when submitting with no lines", async () => {
    const user = userEvent.setup();
    renderWithProviders(withProviders(<BulkForm />));
    await user.click(screen.getByRole("button", { name: /buscar en lote/i }));
    expect(await screen.findByText(messages.bulk.empty)).toBeInTheDocument();
  });

  it("shows the tooMany error when entering more than 50 lines", async () => {
    const user = userEvent.setup();
    renderWithProviders(withProviders(<BulkForm />));
    const textarea = screen.getByRole("textbox", { name: /lote|tracks/i });
    await user.click(textarea);
    await user.paste(lines(51));
    await user.click(screen.getByRole("button", { name: /buscar en lote/i }));
    expect(await screen.findByText(messages.bulk.tooMany)).toBeInTheDocument();
  });

  it("submits valid lines, calls /api/bulk and surfaces results via onResults", async () => {
    const user = userEvent.setup();
    const onResults = vi.fn();
    let received: unknown = null;
    server.use(
      http.post("/api/bulk", async ({ request }) => {
        received = await request.json();
        const data: BulkData = {
          results: [{ query: "Joy Orbison - Hyph Mngo", track: sourceTrack, similar_tracks: similarTracks }],
          unmatched: [],
        };
        return HttpResponse.json({ ok: true, data, meta: {} });
      }),
    );

    renderWithProviders(withProviders(<BulkForm onResults={onResults} />));
    const textarea = screen.getByRole("textbox", { name: /lote|tracks/i });
    await user.click(textarea);
    await user.paste("Joy Orbison - Hyph Mngo");
    await user.click(screen.getByRole("button", { name: /buscar en lote/i }));

    await waitFor(() => expect(onResults).toHaveBeenCalledTimes(1));
    expect(onResults).toHaveBeenCalledWith(
      expect.objectContaining({ unmatched: [], results: expect.any(Array) }),
    );
    expect(received).toMatchObject({ tracks: ["Joy Orbison - Hyph Mngo"] });
  });

  it("surfaces an error toast when the API fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.post("/api/bulk", () =>
        HttpResponse.json(
          { ok: false, error: { code: "RATE_LIMITED", message: "rate", status: 429 } },
          { status: 429 },
        ),
      ),
    );

    renderWithProviders(withProviders(<BulkForm />));
    const textarea = screen.getByRole("textbox", { name: /lote|tracks/i });
    await user.click(textarea);
    await user.paste("Joy Orbison - Hyph Mngo");
    await user.click(screen.getByRole("button", { name: /buscar en lote/i }));

    expect(await screen.findByText(messages.errors.rateLimited)).toBeInTheDocument();
  });
});
