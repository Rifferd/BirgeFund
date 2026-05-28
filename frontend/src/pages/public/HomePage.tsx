import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useHealth } from "@/features/health/hooks/useHealth";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { routes } from "@/shared/config/routes";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import {
  Button,
  Card,
  CardContent,
  ErrorState,
  LoadingState,
  ProjectCard,
  StatusBadge,
  TestModeBanner,
} from "@/shared/ui";

export function HomePage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const healthQuery = useHealth();
  const categoriesQuery = useCategories();
  const projectsQuery = useProjects({
    status: "fundraising",
    page_size: 6,
  });

  const backendStatus =
    healthQuery.isLoading
      ? "Проверяем..."
      : healthQuery.isError
        ? "Backend недоступен"
        : healthQuery.data?.status === "ok"
          ? "Backend работает"
          : "Неизвестно";

  const projects = projectsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
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
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={healthQuery.isError ? "red" : "sky"}>
                {backendStatus}
              </StatusBadge>
              <StatusBadge tone="amber">TEST MODE</StatusBadge>
            </div>

            <h2 className="mt-5 text-2xl font-black">Данные идут из backend API</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Категории и проекты ниже загружаются с FastAPI. Если backend выключен,
              интерфейс покажет состояние ошибки.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Категории
                </p>
                <p className="mt-1 text-2xl font-black">{categories.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Проекты
                </p>
                <p className="mt-1 text-2xl font-black">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <StatusBadge tone="slate">Категории</StatusBadge>
            <h2 className="mt-3 text-3xl font-black">Выберите направление</h2>
          </div>
          <Link to={routes.projects}>
            <Button variant="secondary">Все проекты</Button>
          </Link>
        </div>

        {categoriesQuery.isLoading ? <LoadingState text="Загружаем категории..." /> : null}
        {categoriesQuery.isError ? (
          <ErrorState description="Не удалось загрузить категории из backend API." />
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const translation = getTranslation(category.translations, language);

              return (
                <Card key={category.id}>
                  <CardContent>
                    <h3 className="text-xl font-black">
                      {translation?.name ?? category.slug}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {translation?.description ?? "Описание категории скоро появится."}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <StatusBadge tone="emerald">Идёт сбор</StatusBadge>
            <h2 className="mt-3 text-3xl font-black">Активные проекты</h2>
          </div>
        </div>

        {projectsQuery.isLoading ? <LoadingState text="Загружаем проекты..." /> : null}
        {projectsQuery.isError ? (
          <ErrorState description="Не удалось загрузить проекты из backend API." />
        ) : null}

        {!projectsQuery.isLoading && !projectsQuery.isError ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} language={language} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
