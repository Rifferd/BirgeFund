import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({
  title = "Что-то пошло не так",
  description = "Попробуйте обновить страницу или повторить действие позже.",
}: ErrorStateProps) {
  return (
    <div className="rounded-[32px] border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100">
      <div className="flex gap-3">
        <AlertTriangle className="shrink-0" />
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </div>
  );
}
