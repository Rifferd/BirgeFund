import type { ProjectReward } from "@/entities/reward/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getProjectRewards(projectId: number | string) {
  const payload = await apiClient.get<ProjectReward[] | { items: ProjectReward[] }>(
    endpoints.projects.rewards(projectId),
    {
      auth: false,
    },
  );

  return normalizeApiList(payload);
}
