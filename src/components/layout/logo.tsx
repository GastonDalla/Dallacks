import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Dallacks — inicio"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span aria-hidden="true" className="grid grid-cols-2 gap-0.5">
        <span className="size-2 rounded-[2px] bg-accent transition-transform group-hover:translate-x-px" />
        <span className="size-2 rounded-[2px] bg-accent/40" />
        <span className="size-2 rounded-[2px] bg-accent/40" />
        <span className="size-2 rounded-[2px] bg-accent transition-transform group-hover:-translate-x-px" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-fg">Dallacks</span>
    </Link>
  );
}
