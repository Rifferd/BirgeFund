import { useQuery } from "@tanstack/react-query";

import { getAdminReports } from "@/features/admin/api/adminApi";
import type { AdminReportsQueryParams } from "@/features/admin/api/adminTypes";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminReports(params?: AdminReportsQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "reports", params],
    queryFn: () => getAdminReports(params),
    enabled: isAuthenticated,
  });
}
