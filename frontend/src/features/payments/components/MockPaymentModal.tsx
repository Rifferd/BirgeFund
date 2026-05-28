import { useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { formatMoney } from "../../../shared/lib/formatMoney";
import { paymentsApi, type MockPaymentMethod } from "../api/paymentsApi";

type MockPaymentModalProps = {
  open: boolean;
  projectId: number | string;
  rewardId?: number | string | null;
  amount: number;
  isAnonymous: boolean;
  comment?: string;
  onClose: () => void;
};

export function MockPaymentModal({
  open,
  projectId,
  rewardId,
  amount,
  isAnonymous,
  comment,
  onClose,
}: MockPaymentModalProps) {
  const [method, setMethod] = useState<MockPaymentMethod>("TEST_WALLET");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handlePay() {
    try {
      setStatus("processing");
      setError("");

      const attempt = await paymentsApi.createMockPayment({
        project_id: projectId,
        reward_id: rewardId ?? null,
        amount,
        method,
        is_anonymous: isAnonymous,
        comment,
        idempotency_key: crypto.randomUUID(),
      });

      await paymentsApi.confirmMockPayment(attempt.id);

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось выполнить тестовую оплату");
    }
  }

  return (
    <Modal open={open} title="Тестовая поддержка проекта" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <b>TEST MODE:</b> реальные деньги не списываются. Операция создаётся только для тестирования платформы.
          Номер карты, CVV и банковские данные здесь не вводятся.
        </div>

        <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted dark:text-slate-400">Сумма поддержки</span>
            <b className="text-text dark:text-slate-100">{formatMoney(amount)}</b>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-text dark:text-slate-100">Метод тестовой оплаты</span>
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value as MockPaymentMethod)}
            className="min-h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="TEST_WALLET">TEST_WALLET</option>
            <option value="TEST_CARD">TEST_CARD</option>
            <option value="TEST_BANK">TEST_BANK</option>
          </select>
        </label>

        {status === "success" && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            Тестовая поддержка прошла успешно. Операция появится в истории.
          </div>
        )}

        {status === "error" && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <Button
          onClick={handlePay}
          disabled={status === "processing" || amount <= 0}
          className="w-full"
        >
          {status === "processing" ? "Проводим тестовую операцию..." : "Оплатить в тестовом режиме"}
        </Button>
      </div>
    </Modal>
  );
}
