import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAdminCMSPage,
  updateAdminCMSPage,
} from "@/features/admin/api/adminApi";
import type {
  AdminCMSPageCreateRequest,
  AdminCMSPageUpdateRequest,
} from "@/features/admin/api/adminTypes";

export function useCreateAdminCMSPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminCMSPage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms-pages"] });
    },
  });
}

export function useUpdateAdminCMSPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pageId,
      payload,
    }: {
      pageId: number | string;
      payload: AdminCMSPageUpdateRequest;
    }) => updateAdminCMSPage(pageId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms-pages"] });
    },
  });
}

export type CMSPageFormPayload = AdminCMSPageCreateRequest;
