import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAdminBanner,
  updateAdminBanner,
} from "@/features/admin/api/adminApi";
import type {
  AdminBannerCreateRequest,
  AdminBannerUpdateRequest,
} from "@/features/admin/api/adminTypes";

export function useCreateAdminBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminBanner,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useUpdateAdminBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bannerId,
      payload,
    }: {
      bannerId: number | string;
      payload: AdminBannerUpdateRequest;
    }) => updateAdminBanner(bannerId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export type BannerFormPayload = AdminBannerCreateRequest;
