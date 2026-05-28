export type ApiListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type ApiQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;
