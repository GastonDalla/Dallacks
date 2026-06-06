import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/render";
import { ScoreBar } from "./score-bar";

describe("ScoreBar", () => {
  it("renders the formatted percentage text", () => {
    renderWithProviders(<ScoreBar score={0.87} />);
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("exposes an accessible progressbar with clamped value", () => {
    renderWithProviders(<ScoreBar score={0.5} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps scores above 1 to 100%", () => {
    renderWithProviders(<ScoreBar score={1.5} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps negative scores to 0%", () => {
    renderWithProviders(<ScoreBar score={-0.3} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("uses the label as the accessible name when provided", () => {
    renderWithProviders(<ScoreBar score={0.42} label="Similarity" />);
    expect(screen.getByRole("progressbar", { name: "Similarity" })).toBeInTheDocument();
  });
});
