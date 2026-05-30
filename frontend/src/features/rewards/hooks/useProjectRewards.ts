import { useQuery } from "@tanstack/react-query";

import { getProjectRewards } from "@/features/rewards/api/rewardsApi";

export function useProjectRewards(projectId: number | string | undefined) {
  return useQuery({
    queryKey: ["project-rewards", projectId],
    queryFn: () => getProjectRewards(projectId!),
    enabled: Boolean(projectId),
  });
}
