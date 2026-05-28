import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../model/authStore";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const user = await authApi.me();
        setUser(user);
        return user;
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: false,
  });
}
