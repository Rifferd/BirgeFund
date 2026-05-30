import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { Project } from "@/entities/project/types";
import { AuthorProjectActions } from "@/features/projects/components/AuthorProjectActions";
import { useMyProjects } from "@/features/projects/hooks/useMyProjects";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import { getTranslation } from "@/shared/lib/getTranslation";
import {
  getHumanLabel,
  projectStatusLabels,
  projectTypeLabels,
} from "@/shared/lib/statusLabels";
import type { LanguageCode } from "@/shared/types/api";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  StatusBadge,
  Table,
} from "@/shared/ui";

function getStatusTone(status: string) {
  if (status === "fundraising" || status === "approved" || status === "completed") {
    return "emerald";
  }

  if (status === "draft" || status === "pending_review") {
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

function getProgress(project: Project) {
  const collected = Number(project.gross_collected ?? 0);
  const goal = Number(project.goal_amount ?? 0);

  if (typeof project.progress_percent === "number") {
    return project.progress_percent;
  }

  if (goal <= 0) {
    return 0;
  }

  return Math.min(Math.round((collected / goal) * 100), 100);
}

export function AuthorProjectsPage() {
  const { i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const projectsQuery = useMyProjects();
  const projects = projectsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <StatusBadge tone="emerald">Кабинет автора</StatusBadge>
          <h1 className="mt-3 text-3xl font-black">Мои проекты</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Здесь отображаются проекты текущего автора: черновики, модерация, активные и завершённые проекты.
          </p>
        </div>

        <Link to="/author/projects/create">
          <Button>Создать проект</Button>
        </Link>
      </div>

      {projectsQuery.isLoading ? <LoadingState text="Загружаем проекты автора..." /> : null}

      {projectsQuery.isError ? (
        <ErrorState description="Не удалось загрузить проекты автора." />
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length === 0 ? (
        <EmptyState
          title="Проектов пока нет"
          description="Создайте первый проект, заполните переводы и отправьте его на модерацию."
          action={
            <Link to="/author/projects/create">
              <Button>Создать проект</Button>
            </Link>
          }
        />
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>Проект</Table.HeaderCell>
                  <Table.HeaderCell>Тип</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Прогресс</Table.HeaderCell>
                  <Table.HeaderCell>Дедлайн</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {projects.map((project) => {
                  const translation = getTranslation(project.translations, language);
                  const progress = getProgress(project);

                  return (
                    <Table.Row key={project.id}>
                      <Table.Cell>
                        <div>
                          <p className="font-black">
                            {translation?.title ?? project.slug}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            #{project.id} · {project.slug}
                          </p>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        {getHumanLabel(projectTypeLabels, project.project_type)}
                      </Table.Cell>

                      <Table.Cell>
                        <StatusBadge tone={getStatusTone(project.status)}>
                          {getHumanLabel(projectStatusLabels, project.status)}
                        </StatusBadge>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="min-w-40">
                          <div className="mb-2 flex justify-between text-xs font-bold">
                            <span>{formatMoney(project.gross_collected ?? 0, project.currency)}</span>
                            <span>{progress}%</span>
                          </div>
                          <ProgressBar value={progress} />
                        </div>
                      </Table.Cell>

                      <Table.Cell>{formatDate(project.deadline)}</Table.Cell>

                      <Table.Cell>
                        <AuthorProjectActions project={project} />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {projects.map((project) => {
              const translation = getTranslation(project.translations, language);
              const progress = getProgress(project);

              return (
                <Card key={project.id}>
                  <CardContent>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <StatusBadge tone={getStatusTone(project.status)}>
                          {getHumanLabel(projectStatusLabels, project.status)}
                        </StatusBadge>

                        <h2 className="mt-3 text-xl font-black">
                          {translation?.title ?? project.slug}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          #{project.id} · {getHumanLabel(projectTypeLabels, project.project_type)}
                        </p>
                      </div>

                      <AuthorProjectActions project={project} />
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm font-bold">
                        <span>{formatMoney(project.gross_collected ?? 0, project.currency)}</span>
                        <span className="text-emerald-600">{progress}%</span>
                      </div>

                      <ProgressBar value={progress} />

                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        Дедлайн: {formatDate(project.deadline)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
