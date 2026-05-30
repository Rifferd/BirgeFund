import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AdminProject } from "@/features/admin/api/adminTypes";
import { ProjectModerationModal } from "@/features/admin/components/ProjectModerationModal";
import { useAdminProjects } from "@/features/admin/hooks/useAdminProjects";
import { useClientPagination } from "@/shared/hooks/useClientPagination";
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
  Pagination,
  Select,
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

export function AdminProjectsPage() {
  const { i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const [status, setStatus] = useState("pending_review");
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);

  const projectsQuery = useAdminProjects({
    status: status || undefined,
  });

  const projects = projectsQuery.data ?? [];
  const pagination = useClientPagination(projects, { initialPageSize: 10 });

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <StatusBadge tone="amber">Модерация</StatusBadge>
          <h1 className="mt-3 text-3xl font-black">Проекты</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Проверка, одобрение, публикация, заморозка и отклонение проектов.
          </p>
        </div>

        <div className="w-full md:w-72">
          <Select
            label="Фильтр по статусу"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="pending_review">Ожидает проверки</option>
            <option value="approved">Одобрен</option>
            <option value="fundraising">Идёт сбор</option>
            <option value="rejected">Отклонён</option>
            <option value="frozen">Заморожен</option>
            <option value="">Все проекты</option>
          </Select>
        </div>
      </div>

      {projectsQuery.isLoading ? <LoadingState text="Загружаем проекты..." /> : null}

      {projectsQuery.isError ? (
        <ErrorState description="Не удалось загрузить admin projects. Проверьте права admin/moderator." />
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length === 0 ? (
        <EmptyState
          title="Проектов с таким статусом нет"
          description="Измените фильтр или создайте проект автором и отправьте его на модерацию."
        />
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>Проект</Table.HeaderCell>
                  <Table.HeaderCell>Автор</Table.HeaderCell>
                  <Table.HeaderCell>Тип</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Цель</Table.HeaderCell>
                  <Table.HeaderCell>Дедлайн</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {pagination.items.map((project) => {
                  const translation = getTranslation(project.translations, language);

                  return (
                    <Table.Row key={project.id}>
                      <Table.Cell>
                        <div>
                          <p className="font-black">{translation?.title ?? project.slug}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            #{project.id} · {project.slug}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>#{project.author_id}</Table.Cell>
                      <Table.Cell>{getHumanLabel(projectTypeLabels, project.project_type)}</Table.Cell>
                      <Table.Cell>
                        <StatusBadge tone={getStatusTone(project.status)}>
                          {getHumanLabel(projectStatusLabels, project.status)}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell className="font-black">
                        {formatMoney(project.goal_amount, project.currency)}
                      </Table.Cell>
                      <Table.Cell>{formatDate(project.deadline)}</Table.Cell>
                      <Table.Cell>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSelectedProject(project)}
                        >
                          Модерировать
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {pagination.items.map((project) => {
              const translation = getTranslation(project.translations, language);

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
                          #{project.id} · автор #{project.author_id}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedProject(project)}
                      >
                        Модерировать
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <p><b>Тип:</b> {getHumanLabel(projectTypeLabels, project.project_type)}</p>
                      <p><b>Цель:</b> {formatMoney(project.goal_amount, project.currency)}</p>
                      <p><b>Дедлайн:</b> {formatDate(project.deadline)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && projects.length > 0 ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          canPrev={pagination.canPrev}
          canNext={pagination.canNext}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <ProjectModerationModal
        isOpen={Boolean(selectedProject)}
        project={selectedProject}
        language={language}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
