import { Button } from "@/shared/ui/Button/Button";

type PaginationProps = {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  const canGoPrev = page > 1;
  const canGoNext = page < pages;

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        Страница {page} из {pages}
      </p>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={!canGoPrev} onClick={() => onPageChange(page - 1)}>
          Назад
        </Button>
        <Button type="button" variant="secondary" disabled={!canGoNext} onClick={() => onPageChange(page + 1)}>
          Далее
        </Button>
      </div>
    </div>
  );
}
