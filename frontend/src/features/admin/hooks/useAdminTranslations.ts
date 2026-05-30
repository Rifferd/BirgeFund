import { useQuery } from "@tanstack/react-query";

import { getAdminTranslations } from "@/features/admin/api/adminApi";
import type { AdminTranslationsQueryParams } from "@/features/admin/api/adminTypes";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminTranslations(params?: AdminTranslationsQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "translations", params],
    queryFn: () => getAdminTranslations(params),
    enabled: isAuthenticated,
  });
}
