import { useAuthStore } from "@/features/auth/model/authStore";
import { Card, CardContent, CardHeader, CardTitle, TestModeBanner } from "@/shared/ui";

export function DashboardHomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-5">
      <TestModeBanner compact />

      <Card>
        <CardHeader>
          <CardTitle>Личный кабинет</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Текущий пользователь
            </p>
            <p className="mt-1 text-xl font-black">
              {user?.full_name || user?.email || "Загружаем профиль..."}
            </p>
            {user?.email ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            ) : null}
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Здесь будут профиль, мои поддержки, история операций, уведомления и настройки языка.
            Баланс пользователя не показываем, потому что в demo-версии его нет.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
