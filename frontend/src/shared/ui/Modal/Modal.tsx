import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
};

export function Modal({ isOpen, title, children, footer, onClose, className }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <section
        className={cn(
          "max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-w-lg sm:rounded-[32px]",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-xl font-black">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-5">{children}</div>

        {footer ? <footer className="border-t border-slate-200 p-5 dark:border-slate-800">{footer}</footer> : null}
      </section>
    </div>
  );
}
