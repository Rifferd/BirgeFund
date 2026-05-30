import { useQuery } from "@tanstack/react-query";

import type { ProjectComment } from "@/entities/comment/types";

import { getProjectComments } from "@/features/comments/api/commentsApi";

export function useProjectComments(projectId: number | string | undefined) {
  return useQuery<ProjectComment[]>({
    queryKey: ["comments", "project", projectId],
    queryFn: () => getProjectComments(projectId!),
    enabled: Boolean(projectId),
  });
}
