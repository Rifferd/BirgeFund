import { useQuery } from "@tanstack/react-query";

import { getProjectUpdates } from "@/features/project-updates/api/projectUpdatesApi";

export function useProjectUpdates(projectId: number | string | undefined) {
  return useQuery({
    queryKey: ["project-updates", projectId],
    queryFn: () => getProjectUpdates(projectId!),
    enabled: Boolean(projectId),
  });
}
