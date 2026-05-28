import { AlertTriangle } from "lucide-react";

import { TEST_MODE_DESCRIPTION, TEST_MODE_PAYMENT_WARNING, TEST_MODE_TITLE } from "@/shared/constants/testMode";
import { cn } from "@/shared/lib/cn";

type TestModeBannerProps = {
  compact?: boolean;
  className?: string;
};

export function TestModeBanner({ compact = false, className }: TestModeBannerProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
          <AlertTriangle size={20} />
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide">{TEST_MODE_TITLE}</p>
          <p className="mt-1 text-sm leading-6">{TEST_MODE_DESCRIPTION}</p>
          {!compact ? <p className="mt-1 text-sm leading-6">{TEST_MODE_PAYMENT_WARNING}</p> : null}
        </div>
      </div>
    </div>
  );
}
