import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

import { Button, Card, CardContent, StatusBadge } from "@/shared/ui";

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка приложения";
}

export function ErrorPage() {
  const error = useRouteError();

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-background px-5 py-12 text-brand-text dark:bg-slate-950 dark:text-slate-100">
      <Card className="w-full max-w-2xl">
        <CardContent>
          <StatusBadge tone="red">Frontend error</StatusBadge>

          <h1 className="mt-4 text-3xl font-black">Страница сломалась</h1>

          <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {getErrorMessage(error)}
          </p>

          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Это не белый экран. Теперь ошибка будет видна прямо в интерфейсе.
          </p>

          <Link to="/" className="mt-5 inline-flex">
            <Button>На главную</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
