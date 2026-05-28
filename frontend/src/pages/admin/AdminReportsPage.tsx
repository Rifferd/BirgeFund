import { useMemo, useState } from "react";

import type { AdminReport } from "@/features/admin/api/adminTypes";
import { ReportModerationModal } from "@/features/admin/components/ReportModerationModal";
import { useAdminReports } from "@/features/admin/hooks/useAdminReports";
import { formatDate } from "@/shared/lib/formatDate";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  StatusBadge,
  Table,
} from "@/shared/ui";

function getReportTone(status: string) {
  if (status === "approved") return "emerald";
  if (status === "pending_review" || status === "draft") return "amber";
  if (status === "rejected") return "red";
  return "slate";
}

export function AdminReportsPage() {
  const [status, setStatus] = useState("pending_review");
  const [projectId, setProjectId] = useState("");
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);

  const params = useMemo(() => {
    return {
      status: status || undefined,
      project_id: projectId || undefined,
    };
  }, [status, projectId]);

  const reportsQuery = useAdminReports(params);
  const reports = reportsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="amber">Reports</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Модерация отчётов</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Проверка публичных отчётов авторов проектов.
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <Select
              label="Статус"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="pending_review">Ожидает проверки</option>
              <option value="approved">Одобрен</option>
              <option value="rejected">Отклонён</option>
              <option value="">Все</option>
            </Select>

            <Input
              label="Project ID"
              placeholder="Например: 48"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {reportsQuery.isLoading ? <LoadingState text="Загружаем отчёты..." /> : null}

      {reportsQuery.isError ? (
        <ErrorState description="Не удалось загрузить reports. Проверьте права reports.moderate." />
      ) : null}

      {!reportsQuery.isLoading && !reportsQuery.isError && reports.length === 0 ? (
        <EmptyState
          title="Отчётов не найдено"
          description="Измените фильтр или создайте отчёт автором проекта."
        />
      ) : null}

      {!reportsQuery.isLoading && !reportsQuery.isError && reports.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Проект</Table.HeaderCell>
                  <Table.HeaderCell>Название</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Язык</Table.HeaderCell>
                  <Table.HeaderCell>Дата</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {reports.map((report) => (
                  <Table.Row key={report.id}>
                    <Table.Cell className="font-black">#{report.id}</Table.Cell>
                    <Table.Cell>#{report.project_id}</Table.Cell>
                    <Table.Cell>{report.title || "Без названия"}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge tone={getReportTone(report.status)}>
                        {report.status}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell>{report.language || "ru"}</Table.Cell>
                    <Table.Cell>{formatDate(report.created_at)}</Table.Cell>
                    <Table.Cell>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedReport(report)}
                      >
                        Проверить
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge tone={getReportTone(report.status)}>
                        {report.status}
                      </StatusBadge>
                      <h2 className="mt-3 text-xl font-black">
                        {report.title || `Отчёт #${report.id}`}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Project #{report.project_id} · {formatDate(report.created_at)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedReport(report)}
                    >
                      Проверить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <ReportModerationModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
