import { Link } from "react-router-dom";

import { useMyPayments } from "@/features/payments/hooks/useMyPayments";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import { getHumanLabel, paymentStatusLabels } from "@/shared/lib/statusLabels";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  Table,
} from "@/shared/ui";

function getPaymentTone(status: string) {
  if (status === "success") return "emerald";
  if (status === "pending") return "amber";
  if (status === "failed" || status === "cancelled") return "red";
  return "slate";
}

export function MySupportsPage() {
  const paymentsQuery = useMyPayments();
  const payments = paymentsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="emerald">Мои поддержки</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">История поддержек</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Здесь отображаются только тестовые поддержки проектов. Реальные деньги не списываются.
        </p>
      </div>

      {paymentsQuery.isLoading ? <LoadingState text="Загружаем поддержки..." /> : null}

      {paymentsQuery.isError ? (
        <ErrorState description="Не удалось загрузить список поддержек." />
      ) : null}

      {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length === 0 ? (
        <EmptyState
          title="Поддержек пока нет"
          description="Откройте каталог проектов и поддержите любой проект в тестовом режиме."
          action={
            <Link className="font-black text-emerald-600" to="/projects">
              Перейти к проектам
            </Link>
          }
        />
      ) : null}

      {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length > 0 ? (
        <>
          <div className="hidden lg:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Проект</Table.HeaderCell>
                  <Table.HeaderCell>Сумма</Table.HeaderCell>
                  <Table.HeaderCell>Метод</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Дата</Table.HeaderCell>
                </tr>
              </Table.Head>
              <Table.Body>
                {payments.map((payment) => (
                  <Table.Row key={payment.id}>
                    <Table.Cell className="font-black">#{payment.id}</Table.Cell>
                    <Table.Cell>#{payment.project_id}</Table.Cell>
                    <Table.Cell className="font-black">
                      {formatMoney(payment.amount, payment.currency)}
                    </Table.Cell>
                    <Table.Cell>{payment.method}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge tone={getPaymentTone(payment.status)}>
                        {getHumanLabel(paymentStatusLabels, payment.status)}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell>{formatDate(payment.created_at)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 lg:hidden">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Тестовая поддержка #{payment.id}
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {formatMoney(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <StatusBadge tone={getPaymentTone(payment.status)}>
                      {getHumanLabel(paymentStatusLabels, payment.status)}
                    </StatusBadge>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><b>Проект:</b> #{payment.project_id}</p>
                    <p><b>Метод:</b> {payment.method}</p>
                    <p><b>Дата:</b> {formatDate(payment.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
