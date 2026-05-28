import { useState } from "react";

import type { AdminComplaint } from "@/features/admin/api/adminTypes";
import { useAdminComplaintStatus } from "@/features/admin/hooks/useAdminComplaintStatus";
import { getApiErrorMessage } from "@/shared/api";
import { formatDate } from "@/shared/lib/formatDate";
import { Button, Modal, Select, StatusBadge, Textarea } from "@/shared/ui";

type ComplaintModerationModalProps = {
  complaint: AdminComplaint | null;
  isOpen: boolean;
  onClose: () => void;
};

const statusOptions = [
  { value: "in_review", label: "Взять на проверку" },
  { value: "resolved", label: "Решить" },
  { value: "rejected", label: "Отклонить" },
];

export function ComplaintModerationModal({
  complaint,
  isOpen,
  onClose,
}: ComplaintModerationModalProps) {
  const [status, setStatus] = useState("resolved");
  const [reason, setReason] = useState("Жалоба обработана модератором.");
  const updateStatusMutation = useAdminComplaintStatus();

  return (
    <Modal
      isOpen={isOpen}
      title="Модерация жалобы"
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
              if (!complaint) {
                return;
              }

              updateStatusMutation.mutate(
                {
                  complaintId: complaint.id,
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
      {complaint ? (
        <div className="space-y-5">
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="amber">{complaint.status}</StatusBadge>

              {complaint.project_id ? (
                <StatusBadge tone="slate">Project #{complaint.project_id}</StatusBadge>
              ) : null}

              {complaint.comment_id ? (
                <StatusBadge tone="slate">Comment #{complaint.comment_id}</StatusBadge>
              ) : null}
            </div>

            <h2 className="mt-3 text-xl font-black">Жалоба #{complaint.id}</h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Создана: {formatDate(complaint.created_at)}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:text-slate-200">
            <p>
              <b>Причина:</b> {complaint.reason || "—"}
            </p>
            <p className="mt-2">
              <b>Описание:</b> {complaint.description || "—"}
            </p>
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
