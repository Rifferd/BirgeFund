import type { SelectHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({ className, label, error, id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="block w-full" htmlFor={selectId}>
      {label ? (
        <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">
          {label}
        </span>
      ) : null}

      <select
        id={selectId}
        className={cn(
          "min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      {error ? <span className="mt-2 block text-sm font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}
