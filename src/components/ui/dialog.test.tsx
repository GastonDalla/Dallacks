import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";
import { Dialog } from "./dialog";

describe("Dialog", () => {
  it("renders nothing when closed", () => {
    renderWithProviders(
      <Dialog open={false} onClose={() => {}} title="Hidden">
        <p>Body</p>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an accessible modal labelled by its title when open", () => {
    renderWithProviders(
      <Dialog open onClose={() => {}} title="My dialog">
        <p>Body</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("My dialog");
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Dialog open onClose={onClose} title="Closable">
        <button type="button">Inside</button>
      </Dialog>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Dialog open onClose={onClose} title="Backdrop">
        <button type="button">Inside</button>
      </Dialog>,
    );
    await user.click(screen.getByTestId("dialog-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when content is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <Dialog open onClose={onClose} title="Content">
        <button type="button">Inside</button>
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Inside" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("traps focus across Tab and Shift+Tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Dialog open onClose={() => {}} title="Trap">
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>,
    );

    const first = screen.getByRole("button", { name: "First" });
    const last = screen.getByRole("button", { name: "Last" });

    await screen.findByRole("dialog");
    expect(document.activeElement).toBe(first);

    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(first);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });
});
