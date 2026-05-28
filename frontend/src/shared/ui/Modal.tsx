import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/60 p-0 sm:items-center sm:p-4">
      <div
        className={cn(
          "w-full rounded-t-[32px] border border-border bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900",
          "sm:mx-auto sm:max-w-lg sm:rounded-[32px]",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black text-text dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Закрыть окно"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
