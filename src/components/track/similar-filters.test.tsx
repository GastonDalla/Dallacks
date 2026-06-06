import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import messages from "../../../messages/es.json";
import { SimilarFilters } from "./similar-filters";

function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("SimilarFilters", () => {
  it("calls onChange with the updated filter when a field changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      withIntl(<SimilarFilters value={{}} onChange={onChange} onReset={vi.fn()} />),
    );

    const yearFrom = screen.getByLabelText(messages.filters.yearFrom);
    await user.type(yearFrom, "1995");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ start_year: expect.any(Number) });
  });

  it("clears a key from the filter when the field is emptied", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      withIntl(<SimilarFilters value={{ start_year: 1995 }} onChange={onChange} onReset={vi.fn()} />),
    );

    const yearFrom = screen.getByLabelText(messages.filters.yearFrom);
    await user.clear(yearFrom);

    expect(onChange).toHaveBeenCalledWith(expect.not.objectContaining({ start_year: expect.anything() }));
  });

  it("calls onReset when the reset button is pressed", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithProviders(
      withIntl(<SimilarFilters value={{ start_year: 1995 }} onChange={vi.fn()} onReset={onReset} />),
    );

    await user.click(screen.getByRole("button", { name: messages.filters.reset }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("shows the active-filter count when filters are set", () => {
    renderWithProviders(
      withIntl(
        <SimilarFilters
          value={{ start_year: 1995, max_price: 30 }}
          onChange={vi.fn()}
          onReset={vi.fn()}
        />,
      ),
    );
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });
});
