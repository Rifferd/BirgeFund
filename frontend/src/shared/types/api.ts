export type ApiMessageResponse = {
  message: string;
};

export type PaginatedResponse<TItem> = {
  items: TItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type LanguageCode = "ru" | "kg" | "en";

export type ID = number;
