export function normalizeApiList<TItem>(payload: TItem[] | { items?: TItem[] } | unknown): TItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: TItem[] }).items;
  }

  return [];
}
