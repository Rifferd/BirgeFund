import { useQuery } from "@tanstack/react-query";

import { getProjectComments } from "@/features/comments/api/commentsApi";

export function useProjectComments(projectId: number | string | undefined) {
  return useQuery({
    queryKey: ["comments", "project", projectId],
    queryFn: () => getProjectComments(projectId!),
    enabled: Boolean(projectId),
  });
}
