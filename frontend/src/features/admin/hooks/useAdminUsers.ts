import { useQuery } from "@tanstack/react-query";

import { getAdminUsers } from "@/features/admin/api/adminApi";
import type { AdminUsersQueryParams } from "@/features/admin/api/adminTypes";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminUsers(params?: AdminUsersQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => getAdminUsers(params),
    enabled: isAuthenticated,
  });
}
