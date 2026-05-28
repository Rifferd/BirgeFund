import { useQuery } from "@tanstack/react-query";

import {
  getAdminProjectLedger,
  getAdminProjectLedgerSummary,
} from "@/features/admin/api/adminApi";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useAdminProjectLedger(projectId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "ledger", "project", projectId],
    queryFn: () => getAdminProjectLedger(projectId),
    enabled: isAuthenticated && Boolean(projectId),
  });
}

export function useAdminProjectLedgerSummary(projectId: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["admin", "ledger", "project-summary", projectId],
    queryFn: () => getAdminProjectLedgerSummary(projectId),
    enabled: isAuthenticated && Boolean(projectId),
  });
}
