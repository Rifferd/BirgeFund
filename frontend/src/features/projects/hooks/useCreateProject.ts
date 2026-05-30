import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProject } from "@/features/projects/api/projectsApi";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
