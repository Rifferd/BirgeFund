import { useQuery } from "@tanstack/react-query";

import { getProjectBySlug } from "@/features/projects/api/projectsApi";

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug(slug!),
    enabled: Boolean(slug),
  });
}
