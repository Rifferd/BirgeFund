import { useProjectReports } from "@/features/project-reports/hooks/useProjectReports";
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

type ProjectReportsSectionProps = {
  projectId: number;
};

function getReportTone(status?: string) {
  if (status === "approved") return "emerald";
  if (status === "pending_review" || status === "draft") return "amber";
  if (status === "rejected") return "red";
  return "slate";
}

function getReportStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    approved: "Одобрен",
    pending_review: "На проверке",
    draft: "Черновик",
    rejected: "Отклонён",
  };

  return labels[status ?? ""] ?? status ?? "Опубликован";
}

export function ProjectReportsSection({ projectId }: ProjectReportsSectionProps) {
  const reportsQuery = useProjectReports(projectId);
  const reports = reportsQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отчёты автора</CardTitle>
      </CardHeader>

      <CardContent>
        {reportsQuery.isLoading ? <LoadingState text="Загружаем отчёты..." /> : null}

        {reportsQuery.isError ? (
          <ErrorState description="Не удалось загрузить отчёты проекта." />
        ) : null}

        {!reportsQuery.isLoading && !reportsQuery.isError && reports.length === 0 ? (
          <EmptyState
            title="Отчётов пока нет"
            description="Отчёты появятся после публикации автором и модерации."
          />
        ) : null}

        {!reportsQuery.isLoading && !reportsQuery.isError && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={getReportTone(report.status)}>
                    {getReportStatusLabel(report.status)}
                  </StatusBadge>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {formatDate(report.created_at)}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-black">
                  {report.title || `Отчёт #${report.id}`}
                </h3>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {report.text || "Текст отчёта отсутствует."}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
