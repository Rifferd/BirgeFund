import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitProjectToReview } from "@/features/projects/api/projectsApi";

export function useSubmitProjectToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitProjectToReview,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
      await queryClient.invalidateQueries({ queryKey: ["project", project.slug] });
    },
  });
}
