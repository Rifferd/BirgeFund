import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  blockAdminUser,
  unblockAdminUser,
  updateAdminUser,
} from "@/features/admin/api/adminApi";
import type {
  AdminUserBlockRequest,
  AdminUserUpdateRequest,
} from "@/features/admin/api/adminTypes";

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number | string;
      payload: AdminUserUpdateRequest;
    }) => updateAdminUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useBlockAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number | string;
      payload: AdminUserBlockRequest;
    }) => blockAdminUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useUnblockAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number | string;
      payload?: AdminUserBlockRequest;
    }) => unblockAdminUser(userId, payload ?? {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
