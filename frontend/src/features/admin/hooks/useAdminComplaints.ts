import { useQuery } from "@tanstack/react-query";

import { getAdminComplaints } from "@/features/admin/api/adminApi";
import type { AdminComplaintsQueryParams } from "@/features/admin/api/adminTypes";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminComplaints(params?: AdminComplaintsQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "complaints", params],
    queryFn: () => getAdminComplaints(params),
    enabled: isAuthenticated,
  });
}
