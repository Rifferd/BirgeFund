import { useAuthStore } from "@/features/auth/model/authStore";
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from "@/shared/ui";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="slate">Профиль</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Мой профиль</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Данные аккаунта</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Email</p>
              <p className="mt-1 font-black">{user?.email ?? "—"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Имя</p>
              <p className="mt-1 font-black">{user?.full_name ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
