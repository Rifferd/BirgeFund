import { useState } from "react";
import { Link } from "react-router-dom";

import type { Project } from "@/entities/project/types";
import type { MockPaymentMethod, PaymentAttempt } from "@/features/payments/api/paymentTypes";
import { MockPaymentModal } from "@/features/payments/components/MockPaymentModal";
import { useCreateMockPayment } from "@/features/payments/hooks/useCreateMockPayment";
import { useAuthStore } from "@/features/auth/model/authStore";
import { getApiErrorMessage } from "@/shared/api";
import { routes } from "@/shared/config/routes";
import { formatMoney } from "@/shared/lib/formatMoney";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
  TestModeBanner,
} from "@/shared/ui";

type SupportFormProps = {
  project: Project;
};

export function SupportForm({ project }: SupportFormProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [amount, setAmount] = useState("5000");
  const [method, setMethod] = useState<MockPaymentMethod>("TEST_CARD");
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [payment, setPayment] = useState<PaymentAttempt | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<PaymentAttempt | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const createPaymentMutation = useCreateMockPayment();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Войдите, чтобы поддержать проект</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Поддержка проекта доступна только авторизованным пользователям. После входа
            вы сможете создать тестовую оплату.
          </p>

          <Link to={routes.login}>
            <Button>Войти в аккаунт</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Параметры поддержки</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();

              const numericAmount = Number(amount);

              createPaymentMutation.mutate(
                {
                  project_id: project.id,
                  amount: numericAmount,
                  currency: project.currency,
                  method,
                  idempotency_key: `support-${project.id}-${Date.now()}`,
                  request_payload: {
                    comment,
                    anonymous,
                    reward_id: null,
                  },
                },
                {
                  onSuccess: (createdPayment) => {
                    setPayment(createdPayment);
                    setConfirmedPayment(null);
                    setIsPaymentModalOpen(true);
                  },
                },
              );
            }}
          >
            <TestModeBanner />

            <Input
              label="Сумма поддержки"
              type="number"
              min={100}
              step={100}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            <Select
              label="Метод тестовой оплаты"
              value={method}
              onChange={(event) => setMethod(event.target.value as MockPaymentMethod)}
            >
              <option value="TEST_CARD">Тестовая карта</option>
              <option value="TEST_WALLET">Тестовый кошелёк</option>
              <option value="TEST_BANK">Тестовый банк</option>
            </Select>

            <Textarea
              label="Комментарий автору"
              placeholder="Например: Удачи проекту!"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              <span>Поддержать анонимно</span>
            </label>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <b>Итого:</b> {formatMoney(Number(amount || 0), project.currency)}
              <br />
              Реальные деньги не списываются. Это demo-операция.
            </div>

            {createPaymentMutation.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                {getApiErrorMessage(createPaymentMutation.error)}
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={createPaymentMutation.isPending}
              disabled={Number(amount) <= 0}
            >
              Перейти к тестовой оплате
            </Button>
          </form>
        </CardContent>
      </Card>

      <MockPaymentModal
        isOpen={isPaymentModalOpen}
        payment={payment}
        confirmedPayment={confirmedPayment}
        onConfirmed={(confirmed) => {
          setPayment(confirmed);
          setConfirmedPayment(confirmed);
        }}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </>
  );
}
