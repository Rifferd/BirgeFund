import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAdminComplaintStatus } from "@/features/admin/api/adminApi";
import type { AdminComplaintStatusUpdateRequest } from "@/features/admin/api/adminTypes";

export function useAdminComplaintStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintId,
      payload,
    }: {
      complaintId: number | string;
      payload: AdminComplaintStatusUpdateRequest;
    }) => updateAdminComplaintStatus(complaintId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "complaints"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
