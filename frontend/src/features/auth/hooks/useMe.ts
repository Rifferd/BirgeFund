import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/model/authStore";

export function useMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const user = await getMe();
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
