import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import type { Project } from "@/entities/project/types";
import { routes } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import { getTranslation } from "@/shared/lib/getTranslation";
import {
  getHumanLabel,
  projectStatusLabels,
  projectTypeLabels,
} from "@/shared/lib/statusLabels";
import type { LanguageCode } from "@/shared/types/api";
import { Card, CardContent } from "@/shared/ui/Card/Card";
import { ProgressBar } from "@/shared/ui/ProgressBar/ProgressBar";
import { StatusBadge } from "@/shared/ui/StatusBadge/StatusBadge";

type ProjectCardProps = {
  project: Project;
  language: LanguageCode;
};

function getStatusTone(status: string) {
  if (status === "fundraising" || status === "funded" || status === "completed") {
    return "emerald";
  }

  if (status === "pending_review" || status === "draft") {
    return "amber";
  }

  if (status === "frozen") {
    return "sky";
  }

  if (status === "rejected" || status === "failed" || status === "cancelled") {
    return "red";
  }

  return "slate";
}

function getProjectUrl(slug: string) {
  return routes.projectDetail.replace(":slug", slug);
}

export function ProjectCard({ project, language }: ProjectCardProps) {
  const translation = getTranslation(project.translations, language);
  const title = translation?.title ?? "Проект без названия";
  const description = translation?.short_description ?? "Описание проекта пока не заполнено.";
  const collected = Number(project.gross_collected ?? 0);
  const goal = Number(project.goal_amount ?? 0);
  const progress =
    typeof project.progress_percent === "number"
      ? project.progress_percent
      : goal > 0
        ? Math.min(Math.round((collected / goal) * 100), 100)
        : 0;

  return (
    <Link to={getProjectUrl(project.slug)} className="block h-full">
      <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-950/40 dark:to-amber-950/30">
          <span className="px-5 text-center text-xl font-black text-emerald-800 dark:text-emerald-100">
            {title}
          </span>
        </div>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={getStatusTone(project.status)}>
              {getHumanLabel(projectStatusLabels, project.status)}
            </StatusBadge>
            <StatusBadge tone="slate">
              {getHumanLabel(projectTypeLabels, project.project_type)}
            </StatusBadge>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <MapPin size={16} />
            {project.city || "Кыргызстан"}
          </div>

          <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight">
            {title}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Собрано
                </p>
                <p className="text-lg font-black">
                  {formatMoney(collected, project.currency)}
                </p>
              </div>
              <p className="text-sm font-black text-emerald-600">{progress}%</p>
            </div>

            <ProgressBar value={progress} />

            <div className="mt-3 flex justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Цель: {formatMoney(goal, project.currency)}</span>
              <span>{formatDate(project.deadline)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
