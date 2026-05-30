import { CheckCircle2 } from "lucide-react";

import type { PaymentAttempt } from "@/features/payments/api/paymentTypes";
import { useConfirmMockPayment } from "@/features/payments/hooks/useConfirmMockPayment";
import { getApiErrorMessage } from "@/shared/api";
import { formatMoney } from "@/shared/lib/formatMoney";
import { Button, Modal, StatusBadge, TestModeBanner } from "@/shared/ui";

type MockPaymentModalProps = {
  isOpen: boolean;
  payment: PaymentAttempt | null;
  confirmedPayment: PaymentAttempt | null;
  onConfirmed: (payment: PaymentAttempt) => void;
  onClose: () => void;
};

export function MockPaymentModal({
  isOpen,
  payment,
  confirmedPayment,
  onConfirmed,
  onClose,
}: MockPaymentModalProps) {
  const confirmMutation = useConfirmMockPayment();

  const isSuccess = confirmedPayment?.status === "success";

  return (
    <Modal
      isOpen={isOpen}
      title={isSuccess ? "Тестовая поддержка прошла" : "Тестовая оплата"}
      onClose={onClose}
      footer={
        isSuccess ? (
          <Button type="button" className="w-full" onClick={onClose}>
            Готово
          </Button>
        ) : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="button"
              isLoading={confirmMutation.isPending}
              onClick={() => {
                if (!payment) {
                  return;
                }

                confirmMutation.mutate(
                  {
                    payment_attempt_id: payment.id,
                  },
                  {
                    onSuccess: onConfirmed,
                  },
                );
              }}
            >
              Оплатить в тестовом режиме
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        <TestModeBanner />

        {isSuccess ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 />
              <div>
                <p className="font-black">Операция подтверждена</p>
                <p className="mt-1 text-sm">
                  Запись создана в payment_attempts и ledger. Реальные деньги не списаны.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {payment ? (
          <div className="space-y-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Payment ID</span>
              <b>{payment.id}</b>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Сумма</span>
              <b>{formatMoney(payment.amount, payment.currency)}</b>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Метод</span>
              <b>{payment.method}</b>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Статус</span>
              <StatusBadge tone={payment.status === "success" ? "emerald" : "amber"}>
                {payment.status === "success" ? "Успешно" : "Ожидает подтверждения"}
              </StatusBadge>
            </div>
          </div>
        ) : null}

        {confirmMutation.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {getApiErrorMessage(confirmMutation.error)}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
