import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProjectComment } from "@/features/comments/api/commentsApi";
import type { CreateProjectCommentRequest } from "@/entities/comment/types";

export function useCreateProjectComment(projectId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectCommentRequest) =>
      createProjectComment(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", "project", projectId],
      });
    },
  });
}
