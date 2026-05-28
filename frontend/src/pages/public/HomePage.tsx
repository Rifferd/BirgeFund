import { Link } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { useProjects } from "../../features/projects/hooks/useProjects";
import { ProjectCard } from "../../shared/ui/ProjectCard";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Button } from "../../shared/ui/Button";
import { routes } from "../../shared/config/routes";

export function HomePage() {
  const { data, isLoading, isError, error } = useProjects({
    page: 1,
    page_size: 6,
    status: "fundraising",
  });

  return (
    <main>
      <section className="container-page py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              TEST MODE: реальные деньги не списываются
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Поддерживайте полезные проекты Кыргызстана
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Авторы публикуют проекты, проходят проверку и собирают поддержку. Это не инвестиционная платформа:
              доход, проценты и прибыль не обещаются.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={routes.projects}>
                <Button className="w-full sm:w-auto">
                  <Search size={18} /> Найти проект
                </Button>
              </Link>
              <Button variant="secondary">
                <Sparkles size={18} /> Создать проект
              </Button>
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-2xl font-black">Активные сборы</h2>
            {isLoading && <LoadingState />}
            {isError && <ErrorState message={error instanceof Error ? error.message : undefined} />}
            {!isLoading && !isError && (!data?.items || data.items.length === 0) && (
              <EmptyState text="Backend пока не вернул активные проекты" />
            )}
            {!isLoading && !isError && data?.items?.[0] && <ProjectCard project={data.items[0]} />}
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">Каталог</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Проекты с backend API</h2>
          </div>
          <Link to={routes.projects}>
            <Button variant="secondary">Смотреть все</Button>
          </Link>
        </div>

        {isLoading && <LoadingState />}
        {isError && <ErrorState message={error instanceof Error ? error.message : undefined} />}
        {!isLoading && !isError && (!data?.items || data.items.length === 0) && (
          <EmptyState text="Проектов пока нет" />
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data?.items?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
