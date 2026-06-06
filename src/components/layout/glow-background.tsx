import { cn } from "@/lib/utils/cn";

export function GlowBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-glow", className)}
    />
  );
}
