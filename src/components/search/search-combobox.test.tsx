import { afterEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { renderWithProviders, screen, userEvent, waitFor } from "@/test/render";
import { server } from "@/test/server";
import { searchResults } from "@/test/fixtures";
import { ToastProvider } from "@/providers/toast-provider";
import messages from "../../../messages/es.json";

const push = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

import { SearchCombobox } from "./search-combobox";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      <ToastProvider>{ui}</ToastProvider>
    </NextIntlClientProvider>
  );
}

afterEach(() => {
  push.mockReset();
});

describe("SearchCombobox — name mode", () => {
  it("exposes an accessible combobox", () => {
    renderWithProviders(withIntl(<SearchCombobox mode="name" />));
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(combobox).toHaveAccessibleName();
  });

  it("renders suggestions in a listbox as the user types", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ ok: true, data: searchResults, meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="name" />));

    await user.type(screen.getByRole("combobox"), "hyph mngo");

    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(searchResults.length);
    expect(options[0]).toHaveTextContent("Joy Orbison");
    expect(options[0]).toHaveTextContent("Hyph Mngo");

    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  });

  it("moves the active option with ArrowDown and sets aria-activedescendant", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ ok: true, data: searchResults, meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="name" />));

    const combobox = screen.getByRole("combobox");
    await user.type(combobox, "hyph mngo");
    await screen.findByRole("listbox");

    await user.keyboard("{ArrowDown}");
    const options = screen.getAllByRole("option");
    await waitFor(() =>
      expect(combobox).toHaveAttribute("aria-activedescendant", options[0]!.id),
    );
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(combobox).toHaveAttribute("aria-activedescendant", options[1]!.id),
    );
  });

  it("navigates to the active track when Enter is pressed", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ ok: true, data: searchResults, meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="name" />));

    const combobox = screen.getByRole("combobox");
    await user.type(combobox, "hyph mngo");
    await screen.findByRole("listbox");

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining(`/track/${searchResults[0]!.id}`),
    );
  });

  it("navigates when an option is clicked", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ ok: true, data: searchResults, meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="name" />));

    await user.type(screen.getByRole("combobox"), "hyph mngo");
    const options = await screen.findAllByRole("option");

    await user.click(options[1]!);
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining(`/track/${searchResults[1]!.id}`),
    );
  });

  it("closes the listbox on Escape", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ ok: true, data: searchResults, meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="name" />));

    const combobox = screen.getByRole("combobox");
    await user.type(combobox, "hyph mngo");
    await screen.findByRole("listbox");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("announces an empty result set", async () => {
    server.use(
      http.get("/api/search", () =>
        HttpResponse.json({ ok: true, data: [], meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="name" />));

    await user.type(screen.getByRole("combobox"), "zzzznope");
    expect(await screen.findByText(/No encontramos tracks/i)).toBeInTheDocument();
  });
});

describe("SearchCombobox — link mode", () => {
  it("shows an inline error for an unsupported URL", async () => {
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="link" />));

    await user.type(screen.getByRole("textbox"), "https://example.com/foo");
    await user.click(screen.getByRole("button", { name: /link/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/no es de un servicio soportado/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates to the single result of a valid lookup", async () => {
    server.use(
      http.get("/api/lookup", () =>
        HttpResponse.json({ ok: true, data: [searchResults[0]], meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="link" />));

    await user.type(
      screen.getByRole("textbox"),
      "https://www.discogs.com/release/1921107",
    );
    await user.click(screen.getByRole("button", { name: /link/i }));

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining(`/track/${searchResults[0]!.id}`),
    );
  });

  it("renders a selectable list when the lookup returns multiple results", async () => {
    server.use(
      http.get("/api/lookup", () =>
        HttpResponse.json({ ok: true, data: searchResults, meta: {} }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(withIntl(<SearchCombobox mode="link" />));

    await user.type(
      screen.getByRole("textbox"),
      "https://www.discogs.com/artist/123",
    );
    await user.click(screen.getByRole("button", { name: /link/i }));

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(searchResults.length);
    expect(push).not.toHaveBeenCalled();

    await user.click(options[1]!);
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining(`/track/${searchResults[1]!.id}`),
    );
  });
});
