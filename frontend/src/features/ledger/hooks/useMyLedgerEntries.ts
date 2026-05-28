import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/model/authStore";
import { getMyLedgerEntries } from "@/features/ledger/api/ledgerApi";

export function useMyLedgerEntries() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["ledger", "my"],
    queryFn: getMyLedgerEntries,
    enabled: isAuthenticated,
  });
}
