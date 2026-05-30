import { useQuery } from "@tanstack/react-query";

import type { ProjectReward } from "@/entities/reward/types";

import { getProjectRewards } from "@/features/rewards/api/rewardsApi";

export function useProjectRewards(projectId: number | string | undefined) {
  return useQuery<ProjectReward[]>({
    queryKey: ["project-rewards", projectId],
    queryFn: () => getProjectRewards(projectId!),
    enabled: Boolean(projectId),
  });
}
