import { useMutation } from "@tanstack/react-query";

import { createMockPayment } from "@/features/payments/api/paymentsApi";

export function useCreateMockPayment() {
  return useMutation({
    mutationFn: createMockPayment,
  });
}
