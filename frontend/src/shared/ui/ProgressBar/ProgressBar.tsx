import { cn } from "@/shared/lib/cn";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800", className)}>
      <div
        className="h-full rounded-full bg-brand-primary transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
