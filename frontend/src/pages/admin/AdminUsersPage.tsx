import { useMemo, useState } from "react";

import type { AdminUser } from "@/features/admin/api/adminTypes";
import { UserActionModal } from "@/features/admin/components/UserActionModal";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
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
} from "@/shared/ui";

function getUserStatusTone(user: AdminUser) {
  if (user.is_blocked) return "red";
  if (user.is_active === false) return "amber";
  return "emerald";
}

function getUserStatusLabel(user: AdminUser) {
  if (user.is_blocked) return "Заблокирован";
  if (user.is_active === false) return "Неактивен";
  return "Активен";
}

function getRolesLabel(user: AdminUser) {
  if (!user.roles?.length) {
    return "Без роли";
  }

  return user.roles.map((role) => role.title || role.name).join(", ");
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [blockedFilter, setBlockedFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const params = useMemo(() => {
    return {
      search: search || undefined,
      is_blocked:
        blockedFilter === "blocked"
          ? true
          : blockedFilter === "active"
            ? false
            : undefined,
    };
  }, [search, blockedFilter]);

  const usersQuery = useAdminUsers(params);
  const users = usersQuery.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="sky">Пользователи</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Управление пользователями</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Просмотр пользователей, блокировка и базовое редактирование профиля.
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <Input
              label="Поиск"
              placeholder="Email или имя"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <Select
              label="Статус"
              value={blockedFilter}
              onChange={(event) => setBlockedFilter(event.target.value)}
            >
              <option value="">Все</option>
              <option value="active">Активные</option>
              <option value="blocked">Заблокированные</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {usersQuery.isLoading ? <LoadingState text="Загружаем пользователей..." /> : null}

      {usersQuery.isError ? (
        <ErrorState description="Не удалось загрузить пользователей. Проверьте права users.read." />
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
        <EmptyState
          title="Пользователи не найдены"
          description="Попробуйте изменить поиск или фильтр."
        />
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
        <>
          <div className="hidden xl:block">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>Пользователь</Table.HeaderCell>
                  <Table.HeaderCell>Роли</Table.HeaderCell>
                  <Table.HeaderCell>Статус</Table.HeaderCell>
                  <Table.HeaderCell>Язык</Table.HeaderCell>
                  <Table.HeaderCell>Создан</Table.HeaderCell>
                  <Table.HeaderCell>Действия</Table.HeaderCell>
                </tr>
              </Table.Head>

              <Table.Body>
                {users.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <div>
                        <p className="font-black">{user.email}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          #{user.id} · {user.full_name || "Имя не указано"}
                        </p>
                      </div>
                    </Table.Cell>

                    <Table.Cell>{getRolesLabel(user)}</Table.Cell>

                    <Table.Cell>
                      <StatusBadge tone={getUserStatusTone(user)}>
                        {getUserStatusLabel(user)}
                      </StatusBadge>
                    </Table.Cell>

                    <Table.Cell>{user.preferred_language || "ru"}</Table.Cell>
                    <Table.Cell>{formatDate(user.created_at)}</Table.Cell>

                    <Table.Cell>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setSelectedUser(user)}
                      >
                        Управлять
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <div className="grid gap-4 xl:hidden">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge tone={getUserStatusTone(user)}>
                        {getUserStatusLabel(user)}
                      </StatusBadge>

                      <h2 className="mt-3 text-xl font-black">{user.email}</h2>

                      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        #{user.id} · {user.full_name || "Имя не указано"}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedUser(user)}
                    >
                      Управлять
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><b>Роли:</b> {getRolesLabel(user)}</p>
                    <p><b>Язык:</b> {user.preferred_language || "ru"}</p>
                    <p><b>Создан:</b> {formatDate(user.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <UserActionModal
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
}
