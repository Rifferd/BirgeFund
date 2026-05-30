import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAdminReportStatus } from "@/features/admin/api/adminApi";
import type { AdminReportStatusUpdateRequest } from "@/features/admin/api/adminTypes";

export function useAdminReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      payload,
    }: {
      reportId: number | string;
      payload: AdminReportStatusUpdateRequest;
    }) => updateAdminReportStatus(reportId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
