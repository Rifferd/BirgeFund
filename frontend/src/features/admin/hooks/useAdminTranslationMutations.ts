import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAdminTranslation,
  seedAdminTranslations,
  updateAdminTranslation,
} from "@/features/admin/api/adminApi";
import type {
  AdminStaticTranslationCreateRequest,
  AdminStaticTranslationUpdateRequest,
} from "@/features/admin/api/adminTypes";

export function useSeedAdminTranslations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedAdminTranslations,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "translations"] });
    },
  });
}

export function useCreateAdminTranslation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminTranslation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "translations"] });
      await queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
  });
}

export function useUpdateAdminTranslation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      translationId,
      payload,
    }: {
      translationId: number | string;
      payload: AdminStaticTranslationUpdateRequest;
    }) => updateAdminTranslation(translationId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "translations"] });
      await queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
  });
}
