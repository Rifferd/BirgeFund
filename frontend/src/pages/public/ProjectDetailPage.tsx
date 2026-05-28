import { Link, useParams } from "react-router-dom";
import { useProject } from "../../features/projects/hooks/useProject";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { Button } from "../../shared/ui/Button";
import { ProgressBar } from "../../shared/ui/ProgressBar";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { routes } from "../../shared/config/routes";
import { formatMoney } from "../../shared/lib/formatMoney";
import { formatDate } from "../../shared/lib/formatDate";
import { getProjectTypeLabel } from "../../shared/lib/statusLabels";
import {
  getAuthorName,
  getProjectCategory,
  getProjectCollected,
  getProjectDescription,
  getProjectGoal,
  getProjectImage,
  getProjectProgress,
  getProjectRefundPolicy,
  getProjectRewards,
  getProjectRisks,
  getProjectSlug,
  getProjectTitle,
  getProjectType,
} from "../../entities/project/helpers";

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { data: project, isLoading, isError, error } = useProject(slug);

  if (isLoading) {
    return <main className="container-page py-10"><LoadingState /></main>;
  }

  if (isError || !project) {
    return (
      <main className="container-page py-10">
        <ErrorState message={error instanceof Error ? error.message : "Проект не найден"} />
      </main>
    );
  }

  const image = getProjectImage(project);
  const progress = getProjectProgress(project);
  const rewards = getProjectRewards(project);

  return (
    <main className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_390px] lg:py-12">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-border bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="h-72 bg-slate-100 dark:bg-slate-800 md:h-[420px]">
            {image ? (
              <img src={image} alt={getProjectTitle(project)} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-bold text-muted">Нет изображения</div>
            )}
          </div>

          <div className="p-5 md:p-7">
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge status={project.status} />
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {getProjectCategory(project)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {getProjectTypeLabel(getProjectType(project))}
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight md:text-5xl">{getProjectTitle(project)}</h1>

            <p className="mt-4 text-sm font-semibold text-muted">
              Автор: {getAuthorName(project)} · Город: {project.city || "не указан"}
            </p>

            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
              {getProjectDescription(project)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Поддержка проекта не является инвестицией. Доход не гарантируется. Платформа работает в тестовом режиме.
          Реальные деньги не списываются.
        </div>

        {rewards.length > 0 && (
          <div className="rounded-[32px] border border-border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-black">Вознаграждения</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {rewards.map((reward) => (
                <div key={reward.id} className="rounded-3xl border border-border p-4 dark:border-slate-800">
                  <h3 className="font-black">{reward.title || "Вознаграждение"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {reward.description || "Описание не указано"}
                  </p>
                  <p className="mt-3 font-black text-primary">{formatMoney(reward.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black">Риски</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {getProjectRisks(project) || "Автор пока не добавил описание рисков."}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black">Условия возврата</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {getProjectRefundPolicy(project) || "Условия возврата пока не указаны."}
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[32px] border border-border bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between">
            <span className="text-sm font-bold text-muted">Собрано</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>

          <p className="mt-2 text-3xl font-black">{formatMoney(getProjectCollected(project))}</p>
          <p className="mt-1 text-sm text-muted">из цели {formatMoney(getProjectGoal(project))}</p>

          <div className="mt-5">
            <ProgressBar value={progress} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
            <p className="font-bold">Дедлайн</p>
            <p className="mt-1 text-muted">{formatDate(project.deadline)}</p>
          </div>

          <Link to={routes.supportProject(getProjectSlug(project))}>
            <Button className="mt-5 w-full">Поддержать проект</Button>
          </Link>
        </div>
      </aside>
    </main>
  );
}
