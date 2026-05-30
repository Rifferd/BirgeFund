import type { CMSPage } from "@/entities/cms/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getCMSPages() {
  const payload = await apiClient.get<CMSPage[] | { items: CMSPage[] }>(
    endpoints.cms.pages,
    {
      auth: false,
    },
  );

  return normalizeApiList(payload);
}

export function getCMSPageBySlug(slug: string) {
  return apiClient.get<CMSPage>(endpoints.cms.page(slug), {
    auth: false,
  });
}
