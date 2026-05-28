import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from "@/shared/ui";

const stats = [
  ["Пользователи", "—"],
  ["Проекты", "—"],
  ["Жалобы", "—"],
  ["Тестовые операции", "—"],
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="amber">TEST MODE</StatusBadge>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">Admin dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Строгая админка для пользователей, проектов, платежей, ledger, refund, жалоб,
          отчётов, CMS, переводов и audit log.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <CardContent>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Подключение API</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            После auth и API-клиента эта страница будет брать данные из /api/admin/dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
