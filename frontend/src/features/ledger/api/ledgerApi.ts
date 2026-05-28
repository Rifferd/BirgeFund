import type { LedgerEntry } from "@/entities/ledger/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getMyLedgerEntries() {
  const payload = await apiClient.get<LedgerEntry[] | { items: LedgerEntry[] }>(
    endpoints.ledger.my,
  );

  return normalizeApiList(payload);
}

export async function getProjectLedgerEntries(projectId: number | string) {
  const payload = await apiClient.get<LedgerEntry[] | { items: LedgerEntry[] }>(
    endpoints.ledger.project(projectId),
    {
      auth: false,
    },
  );

  return normalizeApiList(payload);
}
