import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface HowItWorksStep {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface HowItWorksProps {
  heading: string;
  steps: HowItWorksStep[];
  className?: string;
}

const HEADING_ID = "how-it-works-heading";

export function HowItWorks({ heading, steps, className }: HowItWorksProps) {
  return (
    <section aria-labelledby={HEADING_ID} className={cn("w-full text-left", className)}>
      <h2
        id={HEADING_ID}
        className="text-center text-xs font-semibold tracking-[0.2em] text-muted uppercase"
      >
        {heading}
      </h2>

      <ol className="mt-8 grid gap-5 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50"
          >
            <div className="flex items-center justify-between">
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-pill bg-accent/15 text-accent transition-colors group-hover:bg-accent group-hover:text-on-accent"
              >
                {step.icon}
              </span>
              <span
                aria-hidden="true"
                className="font-display text-3xl font-semibold tabular-nums text-border transition-colors group-hover:text-accent/40"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-lg text-fg">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
