import { useQuery } from "@tanstack/react-query";

import { getCMSPages } from "@/features/cms/api/cmsApi";

export function useCMSPages() {
  return useQuery({
    queryKey: ["cms", "pages"],
    queryFn: getCMSPages,
  });
}
