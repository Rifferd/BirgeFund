import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  LoadingState,
  ProjectCard,
  Select,
  StatusBadge,
  TestModeBanner,
} from "@/shared/ui";

export function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const [status, setStatus] = useState("fundraising");
  const [category, setCategory] = useState("");

  const categoriesQuery = useCategories();
  const projectsQuery = useProjects({
    status,
    category: category || undefined,
  });

  const projects = projectsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-8">
        <StatusBadge tone="emerald">Каталог</StatusBadge>
        <h1 className="mt-3 text-4xl font-black">{t("pages.projectsTitle")}</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Все проекты загружаются из backend API. Технические статусы показываем
          человеческим языком.
        </p>
      </div>

      <TestModeBanner compact className="mb-6" />

      <Card className="mb-6">
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Select
              label="Статус"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="fundraising">Идёт сбор</option>
              <option value="funded">Цель собрана</option>
              <option value="completed">Завершён</option>
              <option value="">Все публичные</option>
            </Select>

            <Select
              label="Категория"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Все категории</option>
              {categories.map((item) => {
                const translation = getTranslation(item.translations, language);

                return (
                  <option key={item.id} value={item.slug}>
                    {translation?.name ?? item.slug}
                  </option>
                );
              })}
            </Select>

            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setStatus("fundraising");
                  setCategory("");
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {projectsQuery.isLoading ? <LoadingState text="Загружаем проекты..." /> : null}

      {projectsQuery.isError ? (
        <ErrorState description="Не удалось загрузить каталог проектов." />
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length === 0 ? (
        <EmptyState
          title="Проекты не найдены"
          description="Попробуйте изменить фильтры или проверьте, что demo seed был запущен."
        />
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} language={language} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
