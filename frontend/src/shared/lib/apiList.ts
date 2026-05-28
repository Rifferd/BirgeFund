export function normalizeApiList<TItem>(payload: TItem[] | { items: TItem[] }) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items;
}
