import type { Banner } from "@/entities/banner/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getBanners() {
  const payload = await apiClient.get<Banner[] | { items: Banner[] }>(
    endpoints.banners.list,
    {
      auth: false,
    },
  );

  return normalizeApiList(payload);
}
