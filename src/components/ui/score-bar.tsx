import { cn } from "@/lib/utils/cn";
import { formatScore, scoreToPercent } from "@/lib/utils/format";

export interface ScoreBarProps {
  score: number;
  label?: string;
  className?: string;
}

export function ScoreBar({ score, label, className }: ScoreBarProps) {
  const percent = scoreToPercent(score) ?? 0;
  const text = formatScore(score) || "0%";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2"
      >
        <div
          className="h-full rounded-pill bg-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-muted">{text}</span>
    </div>
  );
}
