export type ApiListPayload<TItem> =
  | TItem[]
  | {
      items?: TItem[];
      results?: TItem[];
      data?: TItem[];
    };

export function normalizeApiList<TItem = any>(payload: unknown): TItem[] {
  if (Array.isArray(payload)) {
    return payload as TItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as {
    items?: unknown;
    results?: unknown;
    data?: unknown;
  };

  if (Array.isArray(record.items)) {
    return record.items as TItem[];
  }

  if (Array.isArray(record.results)) {
    return record.results as TItem[];
  }

  if (Array.isArray(record.data)) {
    return record.data as TItem[];
  }

  return [];
}
