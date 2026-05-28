import { Link } from "react-router-dom";
import type { Project } from "../../entities/project/types";
import {
  getProjectCategory,
  getProjectCollected,
  getProjectDaysLeft,
  getProjectGoal,
  getProjectImage,
  getProjectProgress,
  getProjectShortDescription,
  getProjectSlug,
  getProjectTitle,
  getProjectType,
} from "../../entities/project/helpers";
import { formatMoney } from "../lib/formatMoney";
import { getProjectTypeLabel } from "../lib/statusLabels";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { routes } from "../config/routes";

export function ProjectCard({ project }: { project: Project }) {
  const image = getProjectImage(project);
  const slug = getProjectSlug(project);
  const progress = getProjectProgress(project);
  const daysLeft = getProjectDaysLeft(project);

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <Link to={routes.projectDetail(slug)} className="block">
        <div className="relative h-52 bg-slate-100 dark:bg-slate-800">
          {image ? (
            <img
              src={image}
              alt={getProjectTitle(project)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-bold text-muted">
              Нет изображения
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {getProjectCategory(project)}
            </span>
          </div>
        </div>
      </Link>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={project.status} />
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {getProjectTypeLabel(getProjectType(project))}
          </span>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-muted">{project.city || "Город не указан"}</p>
          <Link to={routes.projectDetail(slug)}>
            <h3 className="text-xl font-black leading-tight text-text hover:text-primary dark:text-slate-100">
              {getProjectTitle(project)}
            </h3>
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {getProjectShortDescription(project)}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Собрано</p>
              <p className="text-lg font-black text-text dark:text-slate-100">
                {formatMoney(getProjectCollected(project))}
              </p>
            </div>
            <p className="text-sm font-bold text-primary">{progress}%</p>
          </div>

          <ProgressBar value={progress} />

          <div className="flex justify-between gap-3 text-sm text-muted">
            <span>Цель: {formatMoney(getProjectGoal(project))}</span>
            <span>{daysLeft === null ? "Срок не указан" : `${daysLeft} дн.`}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
