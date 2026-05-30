import { useState } from "react";

import type { AdminPayment } from "@/features/admin/api/adminTypes";
import { useAdminRefund } from "@/features/admin/hooks/useAdminRefund";
import { getApiErrorMessage } from "@/shared/api";
import { formatMoney } from "@/shared/lib/formatMoney";
import { Button, Modal, StatusBadge, TestModeBanner, Textarea } from "@/shared/ui";

type RefundModalProps = {
  payment: AdminPayment | null;
  isOpen: boolean;
  onClose: () => void;
};

export function RefundModal({ payment, isOpen, onClose }: RefundModalProps) {
  const refundMutation = useAdminRefund();
  const [reason, setReason] = useState("Демонстрационный возврат средств.");

  return (
    <Modal
      isOpen={isOpen}
      title="Создать test refund"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={refundMutation.isPending}
            onClick={() => {
              if (!payment) return;

              refundMutation.mutate(
                {
                  paymentId: payment.id,
                  payload: {
                    reason,
                  },
                },
                {
                  onSuccess: onClose,
                },
              );
            }}
          >
            Создать возврат
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <TestModeBanner compact />

        {payment ? (
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="emerald">Successful payment</StatusBadge>
              <StatusBadge tone="amber">TEST MODE</StatusBadge>
            </div>

            <p className="mt-3 text-xl font-black">
              {formatMoney(payment.amount, payment.currency)}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Payment #{payment.id} · Project #{payment.project_id} · User #{payment.user_id}
            </p>
          </div>
        ) : null}

        <Textarea
          label="Причина возврата"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Refund не удаляет оплату. Backend создаёт отдельную refund-запись и обратную ledger-операцию.
        </div>

        {refundMutation.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {getApiErrorMessage(refundMutation.error)}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
