import { Link } from "react-router-dom";

import { Button, Card, CardContent, StatusBadge } from "@/shared/ui";

export function AccessDeniedPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <Card className="w-full max-w-2xl">
        <CardContent>
          <StatusBadge tone="red">403</StatusBadge>

          <h1 className="mt-4 text-3xl font-black">Нет доступа</h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            У вашего аккаунта нет прав для открытия этого раздела. Войдите под admin,
            moderator, finance или content demo-аккаунтом.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard">
              <Button variant="secondary">В личный кабинет</Button>
            </Link>

            <Link to="/login">
              <Button>Войти другим аккаунтом</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
