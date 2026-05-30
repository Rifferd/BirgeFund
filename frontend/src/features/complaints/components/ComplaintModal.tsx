import { useState } from "react";

import { useCreateComplaint } from "@/features/complaints/hooks/useCreateComplaint";
import { getApiErrorMessage } from "@/shared/api";
import { Button, Modal, Select, Textarea } from "@/shared/ui";

type ComplaintModalProps = {
  isOpen: boolean;
  projectId: number;
  onClose: () => void;
};

const reasonOptions = [
  { value: "fraud", label: "Мошенничество" },
  { value: "false_information", label: "Недостоверная информация" },
  { value: "no_reports", label: "Нет отчётов по проекту" },
  { value: "insults", label: "Оскорбления" },
  { value: "prohibited_content", label: "Запрещённый контент" },
  { value: "other", label: "Другое" },
];

export function ComplaintModal({
  isOpen,
  projectId,
  onClose,
}: ComplaintModalProps) {
  const createComplaintMutation = useCreateComplaint();

  const [reason, setReason] = useState("other");
  const [text, setText] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      title="Пожаловаться на проект"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={createComplaintMutation.isPending}
            disabled={text.trim().length < 2}
            onClick={() => {
              createComplaintMutation.mutate(
                {
                  project_id: projectId,
                  comment_id: null,
                  reason,
                  text,
                },
                {
                  onSuccess: () => {
                    setText("");
                    setReason("other");
                    onClose();
                  },
                },
              );
            }}
          >
            Отправить жалобу
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Select
          label="Причина"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        >
          {reasonOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Описание"
          placeholder="Коротко опишите проблему"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        {createComplaintMutation.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {getApiErrorMessage(createComplaintMutation.error)}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
