import { useQuery } from "@tanstack/react-query";

import { getAdminPayments } from "@/features/admin/api/adminApi";
import type { AdminPaymentsQueryParams } from "@/features/admin/api/adminTypes";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminPayments(params?: AdminPaymentsQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "payments", params],
    queryFn: () => getAdminPayments(params),
    enabled: isAuthenticated,
  });
}
