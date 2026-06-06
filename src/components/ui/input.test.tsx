import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import { Input } from "./input";

describe("Input", () => {
  it("associates the label with the control", () => {
    renderWithProviders(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("renders a hint linked via aria-describedby", () => {
    renderWithProviders(<Input label="Email" hint="We never share it" />);
    const input = screen.getByLabelText("Email");
    const hint = screen.getByText("We never share it");
    expect(input.getAttribute("aria-describedby")).toContain(hint.id);
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("marks the field invalid and exposes an alert when in error", () => {
    renderWithProviders(<Input label="Email" error="Required field" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Required field");
    expect(input.getAttribute("aria-describedby")).toContain(alert.id);
  });

  it("forwards native input props", () => {
    renderWithProviders(<Input label="Search" type="search" placeholder="Type…" />);
    const input = screen.getByLabelText("Search");
    expect(input).toHaveAttribute("type", "search");
    expect(input).toHaveAttribute("placeholder", "Type…");
  });
});
