import type { Category } from "@/entities/category/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getCategories() {
  const payload = await apiClient.get<Category[] | { items: Category[] }>(
    endpoints.categories.list,
    {
      auth: false,
    },
  );

  return normalizeApiList<Category>(payload);
}
