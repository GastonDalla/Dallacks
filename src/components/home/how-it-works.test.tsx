import { describe, expect, it } from "vitest";
import { renderWithProviders, screen, within } from "@/test/render";
import { HowItWorks } from "./how-it-works";

const steps = [
  { title: "Buscá", description: "Escribí un track o pegá un link.", icon: <svg data-testid="icon-0" aria-hidden="true" /> },
  { title: "Descubrí", description: "Mirá tracks que suenan parecido.", icon: <svg data-testid="icon-1" aria-hidden="true" /> },
  { title: "Escuchá", description: "Reproducí sin salir de la página.", icon: <svg data-testid="icon-2" aria-hidden="true" /> },
];

describe("HowItWorks", () => {
  it("exposes an accessible region labelled by the heading", () => {
    renderWithProviders(<HowItWorks heading="Cómo funciona" steps={steps} />);
    const region = screen.getByRole("region", { name: "Cómo funciona" });
    expect(region).toBeInTheDocument();
    expect(within(region).getByRole("heading", { name: "Cómo funciona" })).toBeInTheDocument();
  });

  it("renders every step as an ordered list item with its title and description", () => {
    renderWithProviders(<HowItWorks heading="Cómo funciona" steps={steps} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(steps.length);
    for (const step of steps) {
      expect(screen.getByRole("heading", { name: step.title })).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    }
  });

  it("numbers the steps in order", () => {
    renderWithProviders(<HowItWorks heading="Cómo funciona" steps={steps} />);
    const items = screen.getAllByRole("listitem");
    items.forEach((item, index) => {
      expect(item).toHaveTextContent(String(index + 1).padStart(2, "0"));
    });
  });

  it("keeps decorative icons out of the accessibility tree", () => {
    renderWithProviders(<HowItWorks heading="Cómo funciona" steps={steps} />);
    for (let i = 0; i < steps.length; i += 1) {
      expect(screen.getByTestId(`icon-${i}`)).toHaveAttribute("aria-hidden", "true");
    }
  });
});
