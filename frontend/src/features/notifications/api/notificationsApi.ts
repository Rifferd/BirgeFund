import type { Notification, UnreadCountResponse } from "@/entities/notification/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";
import type { ApiMessageResponse } from "@/shared/types/api";

export async function getMyNotifications() {
  const payload = await apiClient.get<Notification[] | { items: Notification[] }>(
    endpoints.notifications.my,
  );

  return normalizeApiList(payload);
}

export function getUnreadNotificationsCount() {
  return apiClient.get<UnreadCountResponse>(endpoints.notifications.unreadCount);
}

export function markNotificationAsRead(notificationId: number | string) {
  return apiClient.patch<Notification>(endpoints.notifications.read(notificationId));
}

export function markAllNotificationsAsRead() {
  return apiClient.patch<ApiMessageResponse>(endpoints.notifications.readAll);
}
