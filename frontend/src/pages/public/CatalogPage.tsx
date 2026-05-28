import { useState } from "react";
import { useProjects } from "../../features/projects/hooks/useProjects";
import { ProjectCard } from "../../shared/ui/ProjectCard";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Button } from "../../shared/ui/Button";

export function CatalogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [projectType, setProjectType] = useState("");

  const { data, isLoading, isError, error } = useProjects({
    page,
    page_size: 12,
    search,
    status,
    project_type: projectType,
  });

  return (
    <main className="container-page py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black md:text-5xl">Каталог проектов</h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Данные загружаются напрямую из backend API. Фейковые проекты на frontend не используются.
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-3xl border border-border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
        <input
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Поиск проекта"
          className="min-h-11 rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
        />

        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="min-h-11 rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">Все статусы</option>
          <option value="fundraising">Идёт сбор</option>
          <option value="funded">Цель собрана</option>
          <option value="completed">Завершён</option>
        </select>

        <select
          value={projectType}
          onChange={(event) => {
            setPage(1);
            setProjectType(event.target.value);
          }}
          className="min-h-11 rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">Все типы</option>
          <option value="donation">Благотворительная поддержка</option>
          <option value="reward">С вознаграждением</option>
          <option value="preorder">Предзаказ</option>
          <option value="business_support">Поддержка бизнеса</option>
        </select>

        <Button
          variant="secondary"
          onClick={() => {
            setSearch("");
            setStatus("");
            setProjectType("");
            setPage(1);
          }}
        >
          Сбросить
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={error instanceof Error ? error.message : undefined} />}
      {!isLoading && !isError && (!data?.items || data.items.length === 0) && (
        <EmptyState text="Backend не вернул проекты по этим фильтрам" />
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data?.items?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {data && data.pages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-3xl border border-border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
          <p className="text-sm font-semibold text-muted">
            Страница {data.page} из {data.pages}. Всего: {data.total}
          </p>

          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              Назад
            </Button>
            <Button variant="secondary" disabled={page >= data.pages} onClick={() => setPage((value) => value + 1)}>
              Далее
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
