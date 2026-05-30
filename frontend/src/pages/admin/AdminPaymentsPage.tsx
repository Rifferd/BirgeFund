import { useMemo, useState } from "react";

import type { AdminPayment } from "@/features/admin/api/adminTypes";
import { RefundModal } from "@/features/admin/components/RefundModal";
import { useAdminPayments } from "@/features/admin/hooks/useAdminPayments";
import { useClientPagination } from "@/shared/hooks/useClientPagination";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import { getHumanLabel, paymentStatusLabels } from "@/shared/lib/statusLabels";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Pagination,
  Select,
  StatusBadge,
  Table,
} from "@/shared/ui";

function getPaymentTone(status: string) {
  if (status === "success") return "emerald";
  if (status === "pending") return "amber";
  if (status === "failed" || status === "cancelled") return "red";
  return "slate";
}

export function AdminPaymentsPage() {
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

  const params = useMemo(() => {
    return {
      status: status || undefined,
      project_id: projectId || undefined,
    };
  }, [status, projectId]);

  const paymentsQuery = useAdminPayments(params);
  const payments = paymentsQuery.data ?? [];
  const pagination = useClientPagination(payments, { initialPageSize: 10 });

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="sky">Payments</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Тестовые платежи</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Просмотр mock payments и запуск test refund. Реальные банковские данные не используются.
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <Select
              label="Статус"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Все</option>
              <option value="pending">Ожидает подтверждения</option>
              <option value="success">Успешно</option>
              <option value="failed">Ошибка</option>
              <option value="cancelled">Отменено</option>
            </Select>

            <Input
              label="Project ID"
              placeholder="Например: 48"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {paymentsQuery.isLoading ? <LoadingState text="Загружаем платежи..." /> : null}

      {paymentsQuery.isError ? (
        <ErrorState description="Не удалось загрузить admin payments. Проверьте права payments.read." />
      ) : null}

      {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length === 0 ? (
        <EmptyState
          title="Платежей не найдено"
          description="Создайте тестовую поддержку проекта или измените фильтры."
        />
      ) : null}

      {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Проект</Table.HeaderCell>
                  <Table.HeaderCell>Пользователь</Table.HeaderCell>
                  <Table.HeaderCell>Сумма</Table.HeaderCell>
                  <Table.HeaderCell>Метод</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Дата</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {pagination.items.map((payment) => (
                  <Table.Row key={payment.id}>
                    <Table.Cell className="font-black">#{payment.id}</Table.Cell>
                    <Table.Cell>#{payment.project_id}</Table.Cell>
                    <Table.Cell>#{payment.user_id}</Table.Cell>
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
                    <Table.Cell>
                      <Button
                        type="button"
                        variant={payment.status === "success" ? "danger" : "secondary"}
                        disabled={payment.status !== "success"}
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Refund
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {pagination.items.map((payment) => (
              <Card key={payment.id}>
                <CardContent>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge tone={getPaymentTone(payment.status)}>
                        {getHumanLabel(paymentStatusLabels, payment.status)}
                      </StatusBadge>
                      <h2 className="mt-3 text-xl font-black">
                        {formatMoney(payment.amount, payment.currency)}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Payment #{payment.id} · Project #{payment.project_id}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={payment.status === "success" ? "danger" : "secondary"}
                      disabled={payment.status !== "success"}
                      onClick={() => setSelectedPayment(payment)}
                    >
                      Refund
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><b>User:</b> #{payment.user_id}</p>
                    <p><b>Method:</b> {payment.method}</p>
                    <p><b>Date:</b> {formatDate(payment.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {!paymentsQuery.isLoading && !paymentsQuery.isError && payments.length > 0 ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          canPrev={pagination.canPrev}
          canNext={pagination.canNext}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <RefundModal
        payment={selectedPayment}
        isOpen={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
}
