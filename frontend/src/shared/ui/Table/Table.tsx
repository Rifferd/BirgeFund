import type { HTMLAttributes, TableHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

function Root({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
      <table className={cn("w-full min-w-[720px] text-left text-sm", className)} {...props} />
    </div>
  );
}

function Head({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300", className)} {...props} />;
}

function Body({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900", className)} {...props} />;
}

function Row({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition hover:bg-slate-50 dark:hover:bg-slate-800/70", className)} {...props} />;
}

function Cell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-4 align-middle", className)} {...props} />;
}

function HeaderCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("p-4 font-black", className)} {...props} />;
}

export const Table = {
  Root,
  Head,
  Body,
  Row,
  Cell,
  HeaderCell,
};
