import { useState } from "react";

import {
  useAdminProjectLedger,
  useAdminProjectLedgerSummary,
} from "@/features/admin/hooks/useAdminLedger";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  StatusBadge,
  Table,
} from "@/shared/ui";

function getLedgerTone(type: string) {
  if (type === "PROJECT_GROSS" || type === "PROJECT_NET") return "emerald";
  if (type === "PLATFORM_FEE") return "amber";
  if (type === "REFUND") return "red";
  return "slate";
}

function getLedgerLabel(type: string) {
  const labels: Record<string, string> = {
    PROJECT_GROSS: "Поддержка проекта",
    PLATFORM_FEE: "Тестовая комиссия",
    PROJECT_NET: "Сумма проекту",
    REFUND: "Тестовый возврат",
    ADMIN_ADJUSTMENT: "Админская корректировка",
  };

  return labels[type] ?? type;
}

export function AdminLedgerPage() {
  const [draftProjectId, setDraftProjectId] = useState("");
  const [projectId, setProjectId] = useState("");

  const ledgerQuery = useAdminProjectLedger(projectId);
  const summaryQuery = useAdminProjectLedgerSummary(projectId);

  const entries = ledgerQuery.data ?? [];
  const summary = summaryQuery.data;

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="sky">Ledger</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Финансовый журнал проекта</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Ledger нельзя редактировать или удалять. Здесь только просмотр immutable операций.
        </p>
      </div>

      <Card>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setProjectId(draftProjectId.trim());
            }}
          >
            <Input
              label="Project ID"
              placeholder="Например: 48"
              value={draftProjectId}
              onChange={(event) => setDraftProjectId(event.target.value)}
            />

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Загрузить ledger
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!projectId ? (
        <EmptyState
          title="Укажите Project ID"
          description="Откройте admin projects или таблицу payments, скопируйте ID проекта и загрузите ledger."
        />
      ) : null}

      {projectId && summaryQuery.isLoading ? <LoadingState text="Загружаем summary..." /> : null}

      {projectId && summaryQuery.isError ? (
        <ErrorState description="Не удалось загрузить ledger summary проекта." />
      ) : null}

      {projectId && summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Gross</p>
              <p className="mt-2 text-2xl font-black">
                {formatMoney(summary.gross_collected ?? 0, String(summary.currency ?? "KGS"))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Platform fee</p>
              <p className="mt-2 text-2xl font-black">
                {formatMoney(summary.platform_fee_amount ?? 0, String(summary.currency ?? "KGS"))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Net</p>
              <p className="mt-2 text-2xl font-black">
                {formatMoney(summary.net_amount ?? 0, String(summary.currency ?? "KGS"))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Refunded</p>
              <p className="mt-2 text-2xl font-black">
                {formatMoney(summary.refunded_amount ?? 0, String(summary.currency ?? "KGS"))}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {projectId && ledgerQuery.isLoading ? <LoadingState text="Загружаем ledger entries..." /> : null}

      {projectId && ledgerQuery.isError ? (
        <ErrorState description="Не удалось загрузить ledger entries проекта." />
      ) : null}

      {projectId && !ledgerQuery.isLoading && !ledgerQuery.isError && entries.length === 0 ? (
        <EmptyState
          title="Ledger пустой"
          description="По этому проекту пока нет финансовых операций."
        />
      ) : null}

      {projectId && !ledgerQuery.isLoading && !ledgerQuery.isError && entries.length > 0 ? (
        <Table.Root>
          <Table.Head>
            <tr>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Тип</Table.HeaderCell>
              <Table.HeaderCell>Payment</Table.HeaderCell>
              <Table.HeaderCell>Пользователь</Table.HeaderCell>
              <Table.HeaderCell>Сумма</Table.HeaderCell>
              <Table.HeaderCell>Статус</Table.HeaderCell>
              <Table.HeaderCell>Дата</Table.HeaderCell>
            </tr>
          </Table.Head>

          <Table.Body>
            {entries.map((entry) => (
              <Table.Row key={entry.id}>
                <Table.Cell className="font-black">#{entry.id}</Table.Cell>
                <Table.Cell>
                  <StatusBadge tone={getLedgerTone(entry.type)}>
                    {getLedgerLabel(entry.type)}
                  </StatusBadge>
                </Table.Cell>
                <Table.Cell>{entry.payment_attempt_id ? `#${entry.payment_attempt_id}` : "—"}</Table.Cell>
                <Table.Cell>{entry.user_id ? `#${entry.user_id}` : "—"}</Table.Cell>
                <Table.Cell className="font-black">
                  {formatMoney(entry.amount, entry.currency)}
                </Table.Cell>
                <Table.Cell>{entry.status ?? "—"}</Table.Cell>
                <Table.Cell>{formatDate(entry.created_at)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : null}
    </div>
  );
}
