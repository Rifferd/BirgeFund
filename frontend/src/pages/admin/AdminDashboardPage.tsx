import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/shared/ui";

function getStatValue(stats: Record<string, unknown> | undefined, keys: string[]) {
  if (!stats) {
    return "—";
  }

  for (const key of keys) {
    const value = stats[key];

    if (typeof value === "number" || typeof value === "string") {
      return value;
    }
  }

  return "—";
}

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();
  const stats = dashboardQuery.data;

  const cards = [
    {
      label: "Пользователи",
      value: getStatValue(stats, ["users_count", "total_users", "users"]),
    },
    {
      label: "Проекты",
      value: getStatValue(stats, ["projects_count", "total_projects", "projects"]),
    },
    {
      label: "На модерации",
      value: getStatValue(stats, ["pending_projects_count", "pending_projects"]),
    },
    {
      label: "Тестовые операции",
      value: getStatValue(stats, ["payments_count", "total_payments", "payments"]),
    },
    {
      label: "Жалобы",
      value: getStatValue(stats, ["complaints_count", "total_complaints", "complaints"]),
    },
    {
      label: "Отчёты",
      value: getStatValue(stats, ["reports_count", "total_reports", "reports"]),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="amber">TEST MODE</StatusBadge>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">Admin dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Данные загружаются из /api/admin/dashboard. Финансовые операции не редактируются и не удаляются.
        </p>
      </div>

      {dashboardQuery.isLoading ? <LoadingState text="Загружаем dashboard..." /> : null}

      {dashboardQuery.isError ? (
        <ErrorState description="Не удалось загрузить admin dashboard. Проверьте, что вы вошли как admin." />
      ) : null}

      {!dashboardQuery.isLoading && !dashboardQuery.isError ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardContent>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-black">{String(card.value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Что можно проверить сейчас</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>Создать проект автором.</li>
            <li>Открыть admin/projects и одобрить проект.</li>
            <li>Опубликовать проект со статусом “Идёт сбор”.</li>
            <li>Проверить проект в публичном каталоге.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
