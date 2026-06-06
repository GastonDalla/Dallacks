import { cn } from "@/lib/utils/cn";

export interface SpinnerProps {
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

const sizes: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
};

export function Spinner({ size = "md", label = "Loading…", className }: SpinnerProps) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "inline-block rounded-full border-current border-t-transparent animate-spin",
          sizes[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
