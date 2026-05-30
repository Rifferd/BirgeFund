import { useQuery } from "@tanstack/react-query";

import { getAdminBanners } from "@/features/admin/api/adminApi";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminBanners() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "banners"],
    queryFn: getAdminBanners,
    enabled: isAuthenticated,
  });
}
