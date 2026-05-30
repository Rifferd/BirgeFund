import { useMemo, useState } from "react";

import type { AdminComplaint } from "@/features/admin/api/adminTypes";
import { ComplaintModerationModal } from "@/features/admin/components/ComplaintModerationModal";
import { useAdminComplaints } from "@/features/admin/hooks/useAdminComplaints";
import { useClientPagination } from "@/shared/hooks/useClientPagination";
import { formatDate } from "@/shared/lib/formatDate";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  StatusBadge,
  Table,
  Pagination,
} from "@/shared/ui";

function getComplaintTone(status: string) {
  if (status === "resolved") return "emerald";
  if (status === "open" || status === "in_review") return "amber";
  if (status === "rejected") return "red";
  return "slate";
}

export function AdminComplaintsPage() {
  const [status, setStatus] = useState("open");
  const [projectId, setProjectId] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);

  const params = useMemo(() => {
    return {
      status: status || undefined,
      project_id: projectId || undefined,
    };
  }, [status, projectId]);

  const complaintsQuery = useAdminComplaints(params);
  const complaints = complaintsQuery.data ?? [];
  const pagination = useClientPagination(complaints, { initialPageSize: 10 });

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="red">Complaints</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Модерация жалоб</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Жалобы на проекты, комментарии и другой пользовательский контент.
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
              <option value="open">Открыта</option>
              <option value="in_review">На проверке</option>
              <option value="resolved">Решена</option>
              <option value="rejected">Отклонена</option>
              <option value="">Все</option>
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

      {complaintsQuery.isLoading ? <LoadingState text="Загружаем жалобы..." /> : null}

      {complaintsQuery.isError ? (
        <ErrorState description="Не удалось загрузить complaints. Проверьте права complaints.manage." />
      ) : null}

      {!complaintsQuery.isLoading && !complaintsQuery.isError && complaints.length === 0 ? (
        <EmptyState
          title="Жалоб не найдено"
          description="Измените фильтр или создайте жалобу из публичной части."
        />
      ) : null}

      {!complaintsQuery.isLoading && !complaintsQuery.isError && complaints.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Project</Table.HeaderCell>
                  <Table.HeaderCell>Comment</Table.HeaderCell>
                  <Table.HeaderCell>Reason</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {pagination.items.map((complaint) => (
                  <Table.Row key={complaint.id}>
                    <Table.Cell className="font-black">#{complaint.id}</Table.Cell>
                    <Table.Cell>{complaint.project_id ? `#${complaint.project_id}` : "—"}</Table.Cell>
                    <Table.Cell>{complaint.comment_id ? `#${complaint.comment_id}` : "—"}</Table.Cell>
                    <Table.Cell>{complaint.reason || "—"}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge tone={getComplaintTone(complaint.status)}>
                        {complaint.status}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell>{formatDate(complaint.created_at)}</Table.Cell>
                    <Table.Cell>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        Обработать
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {pagination.items.map((complaint) => (
              <Card key={complaint.id}>
                <CardContent>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge tone={getComplaintTone(complaint.status)}>
                        {complaint.status}
                      </StatusBadge>
                      <h2 className="mt-3 text-xl font-black">
                        Жалоба #{complaint.id}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {complaint.project_id ? `Project #${complaint.project_id}` : "No project"} · {formatDate(complaint.created_at)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      Обработать
                    </Button>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {complaint.reason || complaint.text || "Описание жалобы отсутствует."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {!complaintsQuery.isLoading && !complaintsQuery.isError && complaints.length > 0 ? (
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

      <ComplaintModerationModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
}
