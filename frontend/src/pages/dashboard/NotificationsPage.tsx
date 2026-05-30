import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/features/notifications/hooks/useNotificationMutations";
import {
  useNotifications,
  useUnreadNotificationsCount,
} from "@/features/notifications/hooks/useNotifications";
import { formatDate } from "@/shared/lib/formatDate";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/shared/ui";

export function NotificationsPage() {
  const notificationsQuery = useNotifications();
  const unreadCountQuery = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <StatusBadge tone="amber">Уведомления</StatusBadge>
          <h1 className="mt-3 text-3xl font-black">Мои уведомления</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Непрочитанных уведомлений: <b>{unreadCount}</b>
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          isLoading={markAllMutation.isPending}
          disabled={unreadCount === 0}
          onClick={() => markAllMutation.mutate()}
        >
          Отметить все прочитанными
        </Button>
      </div>

      {notificationsQuery.isLoading ? <LoadingState text="Загружаем уведомления..." /> : null}

      {notificationsQuery.isError ? (
        <ErrorState description="Не удалось загрузить уведомления." />
      ) : null}

      {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
        <EmptyState
          title="Уведомлений пока нет"
          description="Когда появятся новости по проектам, платежам или модерации, они будут здесь."
        />
      ) : null}

      {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={!notification.is_read ? "border-emerald-200 dark:border-emerald-800" : undefined}
            >
              <CardContent>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={notification.is_read ? "slate" : "emerald"}>
                        {notification.is_read ? "Прочитано" : "Новое"}
                      </StatusBadge>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-black">{notification.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.is_read ? (
                    <Button
                      type="button"
                      variant="secondary"
                      isLoading={markAsReadMutation.isPending}
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                    >
                      Прочитано
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
