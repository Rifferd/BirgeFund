import { useState } from "react";

import type { AdminReport } from "@/features/admin/api/adminTypes";
import { useAdminReportStatus } from "@/features/admin/hooks/useAdminReportStatus";
import { getApiErrorMessage } from "@/shared/api";
import { formatDate } from "@/shared/lib/formatDate";
import { Button, Modal, Select, StatusBadge, Textarea } from "@/shared/ui";

type ReportModerationModalProps = {
  report: AdminReport | null;
  isOpen: boolean;
  onClose: () => void;
};

const statusOptions = [
  { value: "approved", label: "Одобрить" },
  { value: "rejected", label: "Отклонить" },
];

export function ReportModerationModal({
  report,
  isOpen,
  onClose,
}: ReportModerationModalProps) {
  const [status, setStatus] = useState("approved");
  const [reason, setReason] = useState("Отчёт соответствует правилам платформы.");
  const updateStatusMutation = useAdminReportStatus();

  return (
    <Modal
      isOpen={isOpen}
      title="Модерация отчёта"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            isLoading={updateStatusMutation.isPending}
            onClick={() => {
              if (!report) return;

              updateStatusMutation.mutate(
                {
                  reportId: report.id,
                  payload: {
                    status,
                    reason,
                  },
                },
                {
                  onSuccess: onClose,
                },
              );
            }}
          >
            Сохранить статус
          </Button>
        </div>
      }
    >
      {report ? (
        <div className="space-y-5">
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="amber">{report.status}</StatusBadge>
              <StatusBadge tone="slate">Project #{report.project_id}</StatusBadge>
            </div>

            <h2 className="mt-3 text-xl font-black">
              {report.title || `Отчёт #${report.id}`}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Создан: {formatDate(report.created_at)}
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-3xl border border-slate-200 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:text-slate-200">
            {report.text || "Текст отчёта отсутствует."}
          </div>

          <Select
            label="Новый статус"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          <Textarea
            label="Комментарий модератора"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          {updateStatusMutation.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {getApiErrorMessage(updateStatusMutation.error)}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
