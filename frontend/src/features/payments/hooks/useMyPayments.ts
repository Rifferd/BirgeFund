import { useQuery } from "@tanstack/react-query";

import { getMyPayments } from "@/features/payments/api/paymentsApi";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useMyPayments() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["payments", "my"],
    queryFn: getMyPayments,
    enabled: isAuthenticated,
  });
}
