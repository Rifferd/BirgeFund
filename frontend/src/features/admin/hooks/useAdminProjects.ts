import { useQuery } from "@tanstack/react-query";

import { getAdminProjects } from "@/features/admin/api/adminApi";
import type { AdminProjectsQueryParams } from "@/features/admin/api/adminTypes";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminProjects(params?: AdminProjectsQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "projects", params],
    queryFn: () => getAdminProjects(params),
    enabled: isAuthenticated,
  });
}
