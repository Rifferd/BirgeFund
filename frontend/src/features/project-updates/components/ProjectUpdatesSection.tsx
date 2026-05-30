import { useProjectUpdates } from "@/features/project-updates/hooks/useProjectUpdates";
import { formatDate } from "@/shared/lib/formatDate";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/shared/ui";

type ProjectUpdatesSectionProps = {
  projectId: number;
};

export function ProjectUpdatesSection({ projectId }: ProjectUpdatesSectionProps) {
  const updatesQuery = useProjectUpdates(projectId);
  const updates = updatesQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новости проекта</CardTitle>
      </CardHeader>

      <CardContent>
        {updatesQuery.isLoading ? <LoadingState text="Загружаем новости..." /> : null}

        {updatesQuery.isError ? (
          <ErrorState description="Не удалось загрузить новости проекта." />
        ) : null}

        {!updatesQuery.isLoading && !updatesQuery.isError && updates.length === 0 ? (
          <EmptyState
            title="Новостей пока нет"
            description="Автор проекта ещё не публиковал обновления."
          />
        ) : null}

        {!updatesQuery.isLoading && !updatesQuery.isError && updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <article
                key={update.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="sky">Новость</StatusBadge>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {formatDate(update.created_at)}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-black">{update.title}</h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {update.text}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
