import { Link } from "react-router-dom";

import { Button, Card, CardContent, StatusBadge } from "@/shared/ui";

export function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <Card className="w-full max-w-2xl">
        <CardContent>
          <StatusBadge tone="amber">404</StatusBadge>

          <h1 className="mt-4 text-3xl font-black">Страница не найдена</h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Такой страницы нет или ссылка устарела.
          </p>

          <Link to="/" className="mt-6 inline-flex">
            <Button>На главную</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
