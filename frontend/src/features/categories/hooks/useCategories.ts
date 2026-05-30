import { useQuery } from "@tanstack/react-query";

import type { Category } from "@/entities/category/types";
import { getCategories } from "@/features/categories/api/categoriesApi";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}
