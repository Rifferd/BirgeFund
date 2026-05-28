import { useState } from "react";

import type { AdminCMSPage } from "@/features/admin/api/adminTypes";
import { CMSPageModal } from "@/features/admin/components/CMSPageModal";
import { useAdminCMSPages } from "@/features/admin/hooks/useAdminCMSPages";
import { formatDate } from "@/shared/lib/formatDate";
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
  Table,
} from "@/shared/ui";

function getPageTitle(page: AdminCMSPage) {
  return (
    page.translations.find((item) => item.language === "ru")?.title ??
    page.translations[0]?.title ??
    page.slug
  );
}

function getPageStatus(page: AdminCMSPage) {
  if (typeof page.is_published === "boolean") {
    return page.is_published ? "published" : "draft";
  }

  return page.status ?? "unknown";
}

function getStatusTone(status: string) {
  if (status === "published") return "emerald";
  if (status === "draft") return "amber";
  return "slate";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    published: "Опубликована",
    draft: "Черновик",
    unknown: "Неизвестно",
  };

  return labels[status] ?? status;
}

export function AdminCMSPagesPage() {
  const pagesQuery = useAdminCMSPages();
  const pages = pagesQuery.data ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<AdminCMSPage | null>(null);

  function openCreateModal() {
    setSelectedPage(null);
    setIsModalOpen(true);
  }

  function openEditModal(page: AdminCMSPage) {
    setSelectedPage(page);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <StatusBadge tone="sky">CMS</StatusBadge>
          <h1 className="mt-3 text-3xl font-black">CMS-страницы</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Управление статическими страницами платформы на ru/kg/en.
          </p>
        </div>

        <Button type="button" onClick={openCreateModal}>
          Создать страницу
        </Button>
      </div>

      {pagesQuery.isLoading ? <LoadingState text="Загружаем CMS-страницы..." /> : null}

      {pagesQuery.isError ? (
        <ErrorState description="Не удалось загрузить CMS pages. Проверьте право cms.update." />
      ) : null}

      {!pagesQuery.isLoading && !pagesQuery.isError && pages.length === 0 ? (
        <EmptyState
          title="CMS-страниц пока нет"
          description="Создайте страницу, например test-mode или about."
          action={<Button onClick={openCreateModal}>Создать страницу</Button>}
        />
      ) : null}

      {!pagesQuery.isLoading && !pagesQuery.isError && pages.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Страница</Table.HeaderCell>
                  <Table.HeaderCell>Slug</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Переводы</Table.HeaderCell>
                  <Table.HeaderCell>Дата</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {pages.map((page) => {
                  const status = getPageStatus(page);

                  return (
                    <Table.Row key={page.id}>
                      <Table.Cell className="font-black">#{page.id}</Table.Cell>
                      <Table.Cell className="font-black">{getPageTitle(page)}</Table.Cell>
                      <Table.Cell>{page.slug}</Table.Cell>
                      <Table.Cell>
                        <StatusBadge tone={getStatusTone(status)}>
                          {getStatusLabel(status)}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell>
                        {page.translations.map((item) => item.language).join(", ")}
                      </Table.Cell>
                      <Table.Cell>{formatDate(page.created_at)}</Table.Cell>
                      <Table.Cell>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => openEditModal(page)}
                        >
                          Редактировать
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {pages.map((page) => {
              const status = getPageStatus(page);

              return (
                <Card key={page.id}>
                  <CardContent>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <StatusBadge tone={getStatusTone(status)}>
                          {getStatusLabel(status)}
                        </StatusBadge>
                        <h2 className="mt-3 text-xl font-black">{getPageTitle(page)}</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                          #{page.id} · {page.slug}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openEditModal(page)}
                      >
                        Редактировать
                      </Button>
                    </div>

                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                      Переводы: {page.translations.map((item) => item.language).join(", ")}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}

      <CMSPageModal
        page={selectedPage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
