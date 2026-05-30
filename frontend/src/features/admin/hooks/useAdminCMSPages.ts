import { useQuery } from "@tanstack/react-query";

import { getAdminCMSPages } from "@/features/admin/api/adminApi";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminCMSPages() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "cms-pages"],
    queryFn: getAdminCMSPages,
    enabled: isAuthenticated,
  });
}
