import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "@/features/admin/api/adminApi";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminDashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getAdminDashboard,
    enabled: isAuthenticated,
  });
}
