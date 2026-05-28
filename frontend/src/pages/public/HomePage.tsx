import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useHealth } from "@/features/health/hooks/useHealth";
import { routes } from "@/shared/config/routes";
import { Button, Card, CardContent, ProgressBar, StatusBadge, TestModeBanner } from "@/shared/ui";

export function HomePage() {
  const { t } = useTranslation();
  const healthQuery = useHealth();

  const backendStatus =
    healthQuery.isLoading
      ? "Проверяем..."
      : healthQuery.isError
        ? "Backend недоступен"
        : healthQuery.data?.status === "ok"
          ? "Backend работает"
          : "Неизвестно";

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-center">
        <TestModeBanner className="mb-6 max-w-2xl" compact />

        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
          {t("pages.homeTitle")}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          {t("pages.homeDescription")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to={routes.projects}>
            <Button size="lg">{t("actions.openProjects")}</Button>
          </Link>

          <Link to={routes.author}>
            <Button size="lg" variant="secondary">
              {t("navigation.createProject")}
            </Button>
          </Link>
        </div>
      </section>

      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="emerald">Идёт сбор</StatusBadge>
            <StatusBadge tone="slate">Благотворительная поддержка</StatusBadge>
            <StatusBadge tone={healthQuery.isError ? "red" : "sky"}>{backendStatus}</StatusBadge>
          </div>

          <h2 className="mt-5 text-2xl font-black">Книги для школьной библиотеки</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Следующим шагом подключим реальные категории и проекты из backend API.
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span>Собрано в тестовом режиме</span>
              <span className="text-emerald-600">66%</span>
            </div>
            <ProgressBar value={66} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
