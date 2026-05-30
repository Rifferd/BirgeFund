import { Button, Select } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
};

const pageSizeOptions = [5, 10, 20, 50];

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  startIndex,
  endIndex,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onPageSizeChange,
  className,
}: PaginationProps) {
  if (total === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
        Показано {startIndex}–{endIndex} из {total}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-36">
          <Select
            label="На странице"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <Button type="button" variant="secondary" disabled={!canPrev} onClick={onPrev}>
            Назад
          </Button>

          <span className="min-w-24 text-center text-sm font-black">
            {page} / {totalPages}
          </span>

          <Button type="button" variant="secondary" disabled={!canNext} onClick={onNext}>
            Далее
          </Button>
        </div>
      </div>
    </div>
  );
}
