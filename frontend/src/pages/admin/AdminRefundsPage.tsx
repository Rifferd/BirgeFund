import { useAdminRefunds } from "@/features/admin/hooks/useAdminRefunds";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import {
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  Table,
} from "@/shared/ui";

function getRefundTone(status?: string) {
  if (status === "success" || status === "processed") return "emerald";
  if (status === "pending") return "amber";
  if (status === "failed" || status === "cancelled") return "red";
  return "slate";
}

export function AdminRefundsPage() {
  const refundsQuery = useAdminRefunds();
  const refunds = refundsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="red">Refunds</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Тестовые возвраты</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Refund не удаляет payment. Он создаёт отдельную запись и обратную ledger-операцию.
        </p>
      </div>

      {refundsQuery.isLoading ? <LoadingState text="Загружаем refunds..." /> : null}

      {refundsQuery.isError ? (
        <ErrorState description="Не удалось загрузить список refund." />
      ) : null}

      {!refundsQuery.isLoading && !refundsQuery.isError && refunds.length === 0 ? (
        <EmptyState
          title="Refunds пока нет"
          description="Создайте возврат из раздела Payments."
        />
      ) : null}

      {!refundsQuery.isLoading && !refundsQuery.isError && refunds.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Payment</Table.HeaderCell>
                  <Table.HeaderCell>Project</Table.HeaderCell>
                  <Table.HeaderCell>User</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Reason</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {refunds.map((refund) => (
                  <Table.Row key={refund.id}>
                    <Table.Cell className="font-black">#{refund.id}</Table.Cell>
                    <Table.Cell>#{refund.payment_attempt_id}</Table.Cell>
                    <Table.Cell>{refund.project_id ? `#${refund.project_id}` : "—"}</Table.Cell>
                    <Table.Cell>{refund.user_id ? `#${refund.user_id}` : "—"}</Table.Cell>
                    <Table.Cell className="font-black">
                      {formatMoney(refund.amount ?? 0, refund.currency ?? "KGS")}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge tone={getRefundTone(refund.status)}>
                        {refund.status ?? "created"}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell>{refund.reason ?? "—"}</Table.Cell>
                    <Table.Cell>{formatDate(refund.created_at)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {refunds.map((refund) => (
              <Card key={refund.id}>
                <CardContent>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge tone={getRefundTone(refund.status)}>
                        {refund.status ?? "created"}
                      </StatusBadge>
                      <h2 className="mt-3 text-xl font-black">
                        {formatMoney(refund.amount ?? 0, refund.currency ?? "KGS")}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Refund #{refund.id} · Payment #{refund.payment_attempt_id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><b>Project:</b> {refund.project_id ? `#${refund.project_id}` : "—"}</p>
                    <p><b>User:</b> {refund.user_id ? `#${refund.user_id}` : "—"}</p>
                    <p><b>Reason:</b> {refund.reason ?? "—"}</p>
                    <p><b>Date:</b> {formatDate(refund.created_at)}</p>
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
