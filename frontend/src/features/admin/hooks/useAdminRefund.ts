import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAdminRefund } from "@/features/admin/api/adminApi";
import type { AdminRefundCreateRequest } from "@/features/admin/api/adminTypes";

export function useAdminRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: number | string;
      payload: AdminRefundCreateRequest;
    }) => createAdminRefund(paymentId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "ledger"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
