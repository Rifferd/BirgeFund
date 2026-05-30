import { Clock3, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { Project } from "@/entities/project/types";
import { buildSupportProjectUrl } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import { ProgressBar, StatusBadge, TestModeBanner } from "@/shared/ui";

type ProjectFundingCardProps = {
  project: Project;
};

export function ProjectFundingCard({ project }: ProjectFundingCardProps) {
  const collected = Number(project.gross_collected ?? 0);
  const goal = Number(project.goal_amount ?? 0);
  const progress =
    typeof project.progress_percent === "number"
      ? project.progress_percent
      : goal > 0
        ? Math.min(Math.round((collected / goal) * 100), 100)
        : 0;

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Собрано
          </span>
          <StatusBadge tone="emerald">{progress}%</StatusBadge>
        </div>

        <p className="mt-3 text-3xl font-black">
          {formatMoney(collected, project.currency)}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
          из цели {formatMoney(goal, project.currency)}
        </p>

        <ProgressBar value={progress} className="mt-5" />

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
            <Clock3 size={18} />
            <b className="mt-2 block">Дедлайн</b>
            <span className="text-slate-500 dark:text-slate-400">
              {formatDate(project.deadline)}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
            <UsersRound size={18} />
            <b className="mt-2 block">Тип сбора</b>
            <span className="text-slate-500 dark:text-slate-400">
              {project.funding_type === "all_or_nothing" ? "Всё или ничего" : "Гибкий сбор"}
            </span>
          </div>
        </div>

        <Link
          to={buildSupportProjectUrl(project.slug)}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-brand-primaryDark"
        >
          Поддержать проект
        </Link>

        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Поддержка проекта не является инвестицией. Доход не гарантируется.
        </p>
      </div>

      <TestModeBanner />
    </aside>
  );
}
