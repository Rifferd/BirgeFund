import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
};

export function Tabs({ items, value, onChange }: TabsProps) {
  const activeItem = items.find((item) => item.value === value) ?? items[0];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "min-h-11 shrink-0 rounded-xl px-4 py-2 text-sm font-black transition",
              item.value === value
                ? "bg-slate-950 text-white dark:bg-emerald-600"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">{activeItem?.content}</div>
    </div>
  );
}
