import { useMemo, useState } from "react";

import type { AdminStaticTranslation } from "@/features/admin/api/adminTypes";
import { TranslationModal } from "@/features/admin/components/TranslationModal";
import {
  useSeedAdminTranslations,
} from "@/features/admin/hooks/useAdminTranslationMutations";
import { useAdminTranslations } from "@/features/admin/hooks/useAdminTranslations";
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
  StatusBadge,
  Table,
  Pagination,
} from "@/shared/ui";

function getTranslationValue(
  translation: AdminStaticTranslation,
  language: "ru" | "kg" | "en",
) {
  const values = translation.values;

  if (values && typeof values === "object") {
    return values[language] || "—";
  }

  const directValue = (translation as unknown as Record<string, unknown>)[language];

  if (typeof directValue === "string" && directValue.trim()) {
    return directValue;
  }

  return "—";
}

export function AdminTranslationsPage() {
  const [namespace, setNamespace] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] =
    useState<AdminStaticTranslation | null>(null);

  const seedMutation = useSeedAdminTranslations();

  const params = useMemo(() => {
    return {
      namespace: namespace || undefined,
      search: search || undefined,
    };
  }, [namespace, search]);

  const translationsQuery = useAdminTranslations(params);
  const translations = translationsQuery.data ?? [];
  const pagination = useClientPagination(translations, { initialPageSize: 10 });

  function openCreateModal() {
    setSelectedTranslation(null);
    setIsModalOpen(true);
  }

  function openEditModal(translation: AdminStaticTranslation) {
    setSelectedTranslation(translation);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <StatusBadge tone="sky">Translations</StatusBadge>
          <h1 className="mt-3 text-3xl font-black">UI-переводы</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Словарь статических переводов интерфейса. Публичный endpoint: /translations?language=ru.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            isLoading={seedMutation.isPending}
            onClick={() => seedMutation.mutate()}
          >
            Seed default
          </Button>

          <Button type="button" onClick={openCreateModal}>
            Создать перевод
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Namespace"
              placeholder="common"
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
            />

            <Input
              label="Поиск"
              placeholder="key или текст"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {seedMutation.isError ? (
        <ErrorState description="Не удалось запустить seed translations." />
      ) : null}

      {translationsQuery.isLoading ? <LoadingState text="Загружаем переводы..." /> : null}

      {translationsQuery.isError ? (
        <ErrorState description="Не удалось загрузить translations. Проверьте право translations.update." />
      ) : null}

      {!translationsQuery.isLoading && !translationsQuery.isError && translations.length === 0 ? (
        <EmptyState
          title="Переводов не найдено"
          description="Создайте новый перевод или запустите seed default."
          action={<Button onClick={openCreateModal}>Создать перевод</Button>}
        />
      ) : null}

      {!translationsQuery.isLoading && !translationsQuery.isError && translations.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Namespace</Table.HeaderCell>
                  <Table.HeaderCell>Key</Table.HeaderCell>
                  <Table.HeaderCell>RU</Table.HeaderCell>
                  <Table.HeaderCell>KG</Table.HeaderCell>
                  <Table.HeaderCell>EN</Table.HeaderCell>
                  <Table.HeaderCell>Дата</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {pagination.items.map((translation) => (
                  <Table.Row key={translation.id}>
                    <Table.Cell className="font-black">#{translation.id}</Table.Cell>
                    <Table.Cell>{translation.namespace}</Table.Cell>
                    <Table.Cell className="font-black">{translation.key}</Table.Cell>
                    <Table.Cell className="max-w-64 truncate">
                      {getTranslationValue(translation, "ru")}
                    </Table.Cell>
                    <Table.Cell className="max-w-64 truncate">
                      {getTranslationValue(translation, "kg")}
                    </Table.Cell>
                    <Table.Cell className="max-w-64 truncate">
                      {getTranslationValue(translation, "en")}
                    </Table.Cell>
                    <Table.Cell>{formatDate(translation.created_at)}</Table.Cell>
                    <Table.Cell>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openEditModal(translation)}
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
            {pagination.items.map((translation) => (
              <Card key={translation.id}>
                <CardContent>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge tone="slate">{translation.namespace}</StatusBadge>
                      <h2 className="mt-3 text-xl font-black">{translation.key}</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        #{translation.id} · {formatDate(translation.created_at)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openEditModal(translation)}
                    >
                      Редактировать
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><b>RU:</b> {getTranslationValue(translation, "ru")}</p>
                    <p><b>KG:</b> {getTranslationValue(translation, "kg")}</p>
                    <p><b>EN:</b> {getTranslationValue(translation, "en")}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {!translationsQuery.isLoading && !translationsQuery.isError && translations.length > 0 ? (
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

      <TranslationModal
        translation={selectedTranslation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
