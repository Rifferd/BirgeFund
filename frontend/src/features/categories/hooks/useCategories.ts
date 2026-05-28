import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/features/categories/api/categoriesApi";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}
