import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAdminProjectStatus } from "@/features/admin/api/adminApi";
import type { AdminProjectStatusUpdateRequest } from "@/features/admin/api/adminTypes";

export function useUpdateAdminProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: number | string;
      payload: AdminProjectStatusUpdateRequest;
    }) => updateAdminProjectStatus(projectId, payload),
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["project", project.slug] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
