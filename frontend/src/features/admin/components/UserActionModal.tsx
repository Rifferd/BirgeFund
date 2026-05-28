import { useState } from "react";

import type { AdminUser } from "@/features/admin/api/adminTypes";
import {
  useBlockAdminUser,
  useUnblockAdminUser,
  useUpdateAdminUser,
} from "@/features/admin/hooks/useAdminUserMutations";
import { getApiErrorMessage } from "@/shared/api";
import {
  Button,
  Input,
  Modal,
  Select,
  StatusBadge,
  Textarea,
} from "@/shared/ui";

type UserActionModalProps = {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
};

export function UserActionModal({ user, isOpen, onClose }: UserActionModalProps) {
  const updateMutation = useUpdateAdminUser();
  const blockMutation = useBlockAdminUser();
  const unblockMutation = useUnblockAdminUser();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferred_language ?? "ru");
  const [reason, setReason] = useState("Нарушение правил платформы.");

  const isBlocked = Boolean(user?.is_blocked);

  function closeAfterSuccess() {
    onClose();
  }

  const error =
    updateMutation.error ??
    blockMutation.error ??
    unblockMutation.error;

  return (
    <Modal
      isOpen={isOpen}
      title="Управление пользователем"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Закрыть
          </Button>

          <Button
            type="button"
            variant="secondary"
            isLoading={updateMutation.isPending}
            onClick={() => {
              if (!user) return;

              updateMutation.mutate(
                {
                  userId: user.id,
                  payload: {
                    full_name: fullName || null,
                    preferred_language: preferredLanguage || "ru",
                  },
                },
                {
                  onSuccess: closeAfterSuccess,
                },
              );
            }}
          >
            Сохранить
          </Button>

          {isBlocked ? (
            <Button
              type="button"
              isLoading={unblockMutation.isPending}
              onClick={() => {
                if (!user) return;

                unblockMutation.mutate(
                  {
                    userId: user.id,
                    payload: {
                      reason,
                    },
                  },
                  {
                    onSuccess: closeAfterSuccess,
                  },
                );
              }}
            >
              Разблокировать
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              isLoading={blockMutation.isPending}
              onClick={() => {
                if (!user) return;

                blockMutation.mutate(
                  {
                    userId: user.id,
                    payload: {
                      reason,
                    },
                  },
                  {
                    onSuccess: closeAfterSuccess,
                  },
                );
              }}
            >
              Заблокировать
            </Button>
          )}
        </div>
      }
    >
      {user ? (
        <div className="space-y-5">
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={user.is_blocked ? "red" : "emerald"}>
                {user.is_blocked ? "Заблокирован" : "Активен"}
              </StatusBadge>
              <StatusBadge tone={user.is_verified ? "emerald" : "amber"}>
                {user.is_verified ? "Подтверждён" : "Не подтверждён"}
              </StatusBadge>
            </div>

            <p className="mt-3 text-xl font-black">{user.email}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              ID пользователя: #{user.id}
            </p>
          </div>

          <Input
            label="Имя"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />

          <Select
            label="Предпочитаемый язык"
            value={preferredLanguage}
            onChange={(event) => setPreferredLanguage(event.target.value)}
          >
            <option value="ru">Русский</option>
            <option value="kg">Кыргызский</option>
            <option value="en">English</option>
          </Select>

          <Textarea
            label={isBlocked ? "Причина разблокировки" : "Причина блокировки"}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {getApiErrorMessage(error)}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
