import { useMyLedgerEntries } from "@/features/ledger/hooks/useMyLedgerEntries";
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

export function TransactionsPage() {
  const ledgerQuery = useMyLedgerEntries();
  const entries = ledgerQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="sky">Финансовый журнал</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">История операций</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Это immutable ledger: операции не удаляются и не редактируются. Баланс пользователя не показываем.
        </p>
      </div>

      {ledgerQuery.isLoading ? <LoadingState text="Загружаем операции..." /> : null}

      {ledgerQuery.isError ? (
        <ErrorState description="Не удалось загрузить финансовую историю." />
      ) : null}

      {!ledgerQuery.isLoading && !ledgerQuery.isError && entries.length === 0 ? (
        <EmptyState
          title="Операций пока нет"
          description="После тестовой поддержки проекта здесь появятся ledger-записи."
        />
      ) : null}

      {!ledgerQuery.isLoading && !ledgerQuery.isError && entries.length > 0 ? (
        <>
          <div className="hidden lg:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Тип</Table.HeaderCell>
                  <Table.HeaderCell>Проект</Table.HeaderCell>
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
                    <Table.Cell>{entry.project_id ? `#${entry.project_id}` : "—"}</Table.Cell>
                    <Table.Cell className="font-black">
                      {formatMoney(entry.amount, entry.currency)}
                    </Table.Cell>
                    <Table.Cell>{entry.status ?? "—"}</Table.Cell>
                    <Table.Cell>{formatDate(entry.created_at)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 lg:hidden">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Операция #{entry.id}
                      </p>
                      <p className="mt-1 text-2xl font-black">
                        {formatMoney(entry.amount, entry.currency)}
                      </p>
                    </div>
                    <StatusBadge tone={getLedgerTone(entry.type)}>
                      {getLedgerLabel(entry.type)}
                    </StatusBadge>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><b>Проект:</b> {entry.project_id ? `#${entry.project_id}` : "—"}</p>
                    <p><b>Статус:</b> {entry.status ?? "—"}</p>
                    <p><b>Дата:</b> {formatDate(entry.created_at)}</p>
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
