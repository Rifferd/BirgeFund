import { useQuery } from "@tanstack/react-query";

import type { ProjectUpdate } from "@/entities/project-update/types";

import { getProjectUpdates } from "@/features/project-updates/api/projectUpdatesApi";

export function useProjectUpdates(projectId: number | string | undefined) {
  return useQuery<ProjectUpdate[]>({
    queryKey: ["project-updates", projectId],
    queryFn: () => getProjectUpdates(projectId!),
    enabled: Boolean(projectId),
  });
}
