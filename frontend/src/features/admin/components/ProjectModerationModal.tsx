import { useState } from "react";

import type { AdminProject } from "@/features/admin/api/adminTypes";
import { useUpdateAdminProjectStatus } from "@/features/admin/hooks/useUpdateAdminProjectStatus";
import { getApiErrorMessage } from "@/shared/api";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import { Button, Modal, Select, Textarea, TestModeBanner } from "@/shared/ui";

type ProjectModerationModalProps = {
  project: AdminProject | null;
  isOpen: boolean;
  language: LanguageCode;
  onClose: () => void;
};

const statusOptions = [
  { value: "approved", label: "Одобрить" },
  { value: "fundraising", label: "Опубликовать / начать сбор" },
  { value: "rejected", label: "Отклонить" },
  { value: "frozen", label: "Заморозить" },
  { value: "cancelled", label: "Отменить" },
  { value: "completed", label: "Завершить" },
];

export function ProjectModerationModal({
  project,
  isOpen,
  language,
  onClose,
}: ProjectModerationModalProps) {
  const [status, setStatus] = useState("approved");
  const [reason, setReason] = useState("Проект соответствует правилам платформы.");
  const updateStatusMutation = useUpdateAdminProjectStatus();

  const translation = project ? getTranslation(project.translations, language) : undefined;

  return (
    <Modal
      isOpen={isOpen}
      title="Модерация проекта"
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
              if (!project) {
                return;
              }

              updateStatusMutation.mutate(
                {
                  projectId: project.id,
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
      <div className="space-y-5">
        <TestModeBanner compact />

        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Проект
          </p>
          <p className="mt-1 text-xl font-black">
            {translation?.title ?? project?.slug ?? "—"}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Текущий статус: {project?.status ?? "—"}
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
          label="Причина / комментарий модератора"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        {updateStatusMutation.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {getApiErrorMessage(updateStatusMutation.error)}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
