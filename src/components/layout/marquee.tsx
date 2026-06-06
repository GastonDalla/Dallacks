import { cn } from "@/lib/utils/cn";

export function Marquee({ text, className }: { text: string; className?: string }) {
  const items = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div
      aria-hidden="true"
      className={cn("mask-fade-x overflow-hidden bg-accent py-2.5 text-on-accent select-none", className)}
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((group) => (
          <ul key={group} className="flex shrink-0">
            {items.map((i) => (
              <li key={i} className="flex items-center gap-4 px-6 text-sm font-semibold tracking-wide uppercase">
                {text}
                <span className="text-on-accent/50">●</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
