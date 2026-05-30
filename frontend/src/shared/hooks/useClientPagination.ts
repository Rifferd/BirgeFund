import { useEffect, useMemo, useState } from "react";

type UseClientPaginationOptions = {
  initialPageSize?: number;
};

export function useClientPagination<TItem = any>(
  items: readonly TItem[] | undefined | null,
  options: UseClientPaginationOptions = {},
) {
  const safeItems = useMemo<TItem[]>(() => [...(items ?? [])], [items]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(options.initialPageSize ?? 10);

  const total = safeItems.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  useEffect(() => {
    setPage(1);
  }, [total, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo<TItem[]>(() => {
    const start = (page - 1) * pageSize;
    return safeItems.slice(start, start + pageSize);
  }, [safeItems, page, pageSize]);

  function setPageSize(nextPageSize: number) {
    setPageSizeState(nextPageSize);
    setPage(1);
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    items: paginatedItems,
    startIndex: total === 0 ? 0 : (page - 1) * pageSize + 1,
    endIndex: Math.min(page * pageSize, total),
    canPrev: page > 1,
    canNext: page < totalPages,
    setPage,
    setPageSize,
    prevPage: () => setPage((current) => Math.max(current - 1, 1)),
    nextPage: () => setPage((current) => Math.min(current + 1, totalPages)),
  };
}
