import { Card, CardContent, CardHeader, CardTitle, TestModeBanner } from "@/shared/ui";

export function DashboardHomePage() {
  return (
    <div className="space-y-5">
      <TestModeBanner compact />

      <Card>
        <CardHeader>
          <CardTitle>Личный кабинет</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Здесь будут профиль, мои поддержки, история операций, уведомления и настройки языка.
            Баланс пользователя не показываем, потому что в demo-версии его нет.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
