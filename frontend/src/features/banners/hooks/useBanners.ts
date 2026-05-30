import { useQuery } from "@tanstack/react-query";

import type { Banner } from "@/entities/banner/types";

import { getBanners } from "@/features/banners/api/bannersApi";

export function useBanners() {
  return useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: getBanners,
  });
}
