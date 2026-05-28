import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/model/authStore";
import { getMyNotifications, getUnreadNotificationsCount } from "@/features/notifications/api/notificationsApi";

export function useNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["notifications", "my"],
    queryFn: getMyNotifications,
    enabled: isAuthenticated,
  });
}

export function useUnreadNotificationsCount() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationsCount,
    enabled: isAuthenticated,
  });
}
