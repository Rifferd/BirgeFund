import type { ProjectUpdate } from "@/entities/project-update/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getProjectUpdates(projectId: number | string) {
  const payload = await apiClient.get<ProjectUpdate[] | { items: ProjectUpdate[] }>(
    endpoints.projects.updates(projectId),
    {
      auth: false,
    },
  );

  return normalizeApiList<ProjectUpdate>(payload);
}
