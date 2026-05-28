import { useState } from "react";

import type { AdminBanner } from "@/features/admin/api/adminTypes";
import { BannerModal } from "@/features/admin/components/BannerModal";
import { useAdminBanners } from "@/features/admin/hooks/useAdminBanners";
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

function getBannerTitle(banner: AdminBanner) {
  return (
    banner.translations.find((item) => item.language === "ru")?.title ??
    banner.translations[0]?.title ??
    banner.slug
  );
}

function getPlacementLabel(placement: string) {
  const labels: Record<string, string> = {
    home_hero: "Главный экран",
    home_top: "Верх главной",
    home_middle: "Середина главной",
    project_detail: "Страница проекта",
    dashboard: "Личный кабинет",
  };

  return labels[placement] ?? placement;
}

export function AdminBannersPage() {
  const bannersQuery = useAdminBanners();
  const banners = bannersQuery.data ?? [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AdminBanner | null>(null);

  function openCreateModal() {
    setSelectedBanner(null);
    setIsModalOpen(true);
  }

  function openEditModal(banner: AdminBanner) {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <StatusBadge tone="sky">Banners</StatusBadge>
          <h1 className="mt-3 text-3xl font-black">Баннеры</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Управление промо-блоками и TEST MODE баннерами на ru/kg/en.
          </p>
        </div>

        <Button type="button" onClick={openCreateModal}>
          Создать баннер
        </Button>
      </div>

      {bannersQuery.isLoading ? <LoadingState text="Загружаем баннеры..." /> : null}

      {bannersQuery.isError ? (
        <ErrorState description="Не удалось загрузить banners. Проверьте право cms.update." />
      ) : null}

      {!bannersQuery.isLoading && !bannersQuery.isError && banners.length === 0 ? (
        <EmptyState
          title="Баннеров пока нет"
          description="Создайте первый баннер для главной страницы."
          action={<Button onClick={openCreateModal}>Создать баннер</Button>}
        />
      ) : null}

      {!bannersQuery.isLoading && !bannersQuery.isError && banners.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Баннер</Table.HeaderCell>
                  <Table.HeaderCell>Slug</Table.HeaderCell>
                  <Table.HeaderCell>Placement</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Sort</Table.HeaderCell>
                  <Table.HeaderCell>Дата</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {banners.map((banner) => (
                  <Table.Row key={banner.id}>
                    <Table.Cell className="font-black">#{banner.id}</Table.Cell>
                    <Table.Cell className="font-black">{getBannerTitle(banner)}</Table.Cell>
                    <Table.Cell>{banner.slug}</Table.Cell>
                    <Table.Cell>{getPlacementLabel(banner.placement)}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge tone={banner.is_active ? "emerald" : "amber"}>
                        {banner.is_active ? "Активен" : "Выключен"}
                      </StatusBadge>
                    </Table.Cell>
                    <Table.Cell>{banner.sort_order}</Table.Cell>
                    <Table.Cell>{formatDate(banner.created_at)}</Table.Cell>
                    <Table.Cell>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openEditModal(banner)}
                      >
                        Редактировать
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardContent>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge tone={banner.is_active ? "emerald" : "amber"}>
                        {banner.is_active ? "Активен" : "Выключен"}
                      </StatusBadge>
                      <h2 className="mt-3 text-xl font-black">{getBannerTitle(banner)}</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        #{banner.id} · {banner.slug}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openEditModal(banner)}
                    >
                      Редактировать
                    </Button>
                  </div>

                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    Placement: {getPlacementLabel(banner.placement)} · sort: {banner.sort_order}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <BannerModal
        banner={selectedBanner}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
