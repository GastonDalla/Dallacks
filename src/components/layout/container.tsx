import { cn } from "@/lib/utils/cn";
import type { ElementType, ReactNode } from "react";

export function Container({
  as,
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const Comp = as ?? "div";
  return <Comp className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</Comp>;
}
