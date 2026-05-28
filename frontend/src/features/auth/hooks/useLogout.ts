import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logout } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/model/authStore";
import { routes } from "@/shared/config/routes";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      clearSession();
      queryClient.clear();
      navigate(routes.login);
    },
  });
}
