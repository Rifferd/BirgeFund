import { useQuery } from "@tanstack/react-query";

import { getAdminRefunds } from "@/features/admin/api/adminApi";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminRefunds() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "refunds"],
    queryFn: getAdminRefunds,
    enabled: isAuthenticated,
  });
}
