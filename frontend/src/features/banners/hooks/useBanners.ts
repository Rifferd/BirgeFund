import { useQuery } from "@tanstack/react-query";

import { getBanners } from "@/features/banners/api/bannersApi";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
  });
}
