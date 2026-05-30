import { useQuery } from "@tanstack/react-query";

import { getCMSPageBySlug } from "@/features/cms/api/cmsApi";

export function useCMSPage(slug: string | undefined) {
  return useQuery({
    queryKey: ["cms", "page", slug],
    queryFn: () => getCMSPageBySlug(slug!),
    enabled: Boolean(slug),
  });
}
