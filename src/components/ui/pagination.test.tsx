import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders a navigation landmark with the current page marked", () => {
    renderWithProviders(<Pagination page={2} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    const current = screen.getByText("2");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("disables previous on the first page", () => {
    renderWithProviders(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("disables next on the last page", () => {
    renderWithProviders(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /previous/i })).toBeEnabled();
  });

  it("fires onPageChange with the next/previous page", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);

    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("does not fire onPageChange when a disabled control is activated", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("is keyboard operable", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.tab();
    await user.keyboard("{Enter}");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("honors custom aria-labels", () => {
    renderWithProviders(
      <Pagination
        page={2}
        totalPages={5}
        onPageChange={() => {}}
        labelPrevious="Anterior"
        labelNext="Siguiente"
      />,
    );
    expect(screen.getByRole("button", { name: "Anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeInTheDocument();
  });
});
