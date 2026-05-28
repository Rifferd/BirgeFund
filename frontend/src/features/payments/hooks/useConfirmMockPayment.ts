import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { confirmMockPayment } from "@/features/payments/api/paymentsApi";

export function useConfirmMockPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmMockPayment,
    onSuccess: async (payment) => {
      await queryClient.invalidateQueries({
        queryKey: ["project"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["ledger", "project", payment.project_id],
      });
    },
  });
}
