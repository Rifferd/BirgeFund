import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useCreateProjectReport, useCreateProjectReward, useCreateProjectUpdate } from "@/features/projects/hooks/useAuthorProjectMutations";
import { useMyProjects } from "@/features/projects/hooks/useMyProjects";
import { useProjectReports } from "@/features/project-reports/hooks/useProjectReports";
import { useProjectRewards } from "@/features/rewards/hooks/useProjectRewards";
import { useProjectUpdates } from "@/features/project-updates/hooks/useProjectUpdates";
import { getApiErrorMessage } from "@/shared/api";
import { buildProjectUrl } from "@/shared/config/routes";
import { formatDate } from "@/shared/lib/formatDate";
import { formatMoney } from "@/shared/lib/formatMoney";
import { getTranslation } from "@/shared/lib/getTranslation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  StatusBadge,
  Tabs,
  Textarea,
} from "@/shared/ui";

type LanguageCode = "ru" | "kg" | "en";

const tabItems = [
  { value: "updates", label: "Новости" },
  { value: "reports", label: "Отчёты" },
  { value: "rewards", label: "Rewards" },
];

export function AuthorProjectManagePage() {
  const { projectId } = useParams();
  const numericProjectId = Number(projectId);

  const [activeTab, setActiveTab] = useState("updates");

  const myProjectsQuery = useMyProjects();
  const project = useMemo(() => {
    return myProjectsQuery.data?.find((item) => item.id === numericProjectId);
  }, [myProjectsQuery.data, numericProjectId]);

  const title = project
    ? getTranslation(project.translations, "ru")?.title ?? project.slug
    : "Проект";

  if (myProjectsQuery.isLoading) {
    return <LoadingState text="Загружаем проект автора..." />;
  }

  if (myProjectsQuery.isError || !project) {
    return (
      <ErrorState
        title="Проект не найден"
        description="Не удалось найти проект среди проектов текущего автора."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <StatusBadge tone="emerald">Управление проектом</StatusBadge>
          <h1 className="mt-3 text-3xl font-black">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Добавляйте новости, отчёты и reward-пакеты. Публичное отображение зависит от статуса и backend-правил.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/author/projects">
            <Button variant="secondary">К моим проектам</Button>
          </Link>
          <Link to={buildProjectUrl(project.slug)}>
            <Button variant="secondary">Открыть публично</Button>
          </Link>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={tabItems.map((item) => ({
          value: item.value,
          label: item.label,
          content:
            item.value === "updates" ? (
              <AuthorUpdatesPanel projectId={numericProjectId} />
            ) : item.value === "reports" ? (
              <AuthorReportsPanel projectId={numericProjectId} />
            ) : (
              <AuthorRewardsPanel projectId={numericProjectId} currency={project.currency} />
            ),
        }))}
      />
    </div>
  );
}

function AuthorUpdatesPanel({ projectId }: { projectId: number }) {
  const updatesQuery = useProjectUpdates(projectId);
  const createUpdateMutation = useCreateProjectUpdate(projectId);

  const [language, setLanguage] = useState<LanguageCode>("ru");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const updates = updatesQuery.data ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Добавить новость</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();

              createUpdateMutation.mutate(
                {
                  language,
                  title,
                  text,
                  is_public: isPublic,
                },
                {
                  onSuccess: () => {
                    setTitle("");
                    setText("");
                    setIsPublic(true);
                  },
                },
              );
            }}
          >
            <Select
              label="Язык"
              value={language}
              onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            >
              <option value="ru">Русский</option>
              <option value="kg">Кыргызский</option>
              <option value="en">English</option>
            </Select>

            <Input
              label="Заголовок"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Textarea
              label="Текст новости"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-800">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
              />
              <span>Публичная новость</span>
            </label>

            {createUpdateMutation.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                {getApiErrorMessage(createUpdateMutation.error)}
              </div>
            ) : null}

            <Button
              type="submit"
              isLoading={createUpdateMutation.isPending}
              disabled={title.trim().length < 2 || text.trim().length < 5}
            >
              Опубликовать новость
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущие новости</CardTitle>
        </CardHeader>
        <CardContent>
          {updatesQuery.isLoading ? <LoadingState text="Загружаем новости..." /> : null}
          {updatesQuery.isError ? <ErrorState description="Не удалось загрузить новости." /> : null}

          {!updatesQuery.isLoading && !updatesQuery.isError && updates.length === 0 ? (
            <EmptyState title="Новостей пока нет" />
          ) : null}

          <div className="space-y-4">
            {updates.map((update) => (
              <article key={update.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="sky">{update.language || "ru"}</StatusBadge>
                  <StatusBadge tone={update.is_public ? "emerald" : "amber"}>
                    {update.is_public ? "Публичная" : "Скрытая"}
                  </StatusBadge>
                </div>
                <h3 className="mt-3 text-lg font-black">{update.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{update.text}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{formatDate(update.created_at)}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuthorReportsPanel({ projectId }: { projectId: number }) {
  const reportsQuery = useProjectReports(projectId);
  const createReportMutation = useCreateProjectReport(projectId);

  const [language, setLanguage] = useState<LanguageCode>("ru");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const reports = reportsQuery.data ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Добавить отчёт</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();

              createReportMutation.mutate(
                {
                  language,
                  title,
                  text,
                  is_public: true,
                },
                {
                  onSuccess: () => {
                    setTitle("");
                    setText("");
                  },
                },
              );
            }}
          >
            <Select
              label="Язык"
              value={language}
              onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            >
              <option value="ru">Русский</option>
              <option value="kg">Кыргызский</option>
              <option value="en">English</option>
            </Select>

            <Input
              label="Заголовок"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Textarea
              label="Текст отчёта"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              Отчёт может уйти на модерацию. Публичное отображение зависит от backend-статуса.
            </div>

            {createReportMutation.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                {getApiErrorMessage(createReportMutation.error)}
              </div>
            ) : null}

            <Button
              type="submit"
              isLoading={createReportMutation.isPending}
              disabled={title.trim().length < 2 || text.trim().length < 5}
            >
              Отправить отчёт
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущие отчёты</CardTitle>
        </CardHeader>
        <CardContent>
          {reportsQuery.isLoading ? <LoadingState text="Загружаем отчёты..." /> : null}
          {reportsQuery.isError ? <ErrorState description="Не удалось загрузить отчёты." /> : null}

          {!reportsQuery.isLoading && !reportsQuery.isError && reports.length === 0 ? (
            <EmptyState title="Отчётов пока нет" />
          ) : null}

          <div className="space-y-4">
            {reports.map((report) => (
              <article key={report.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="sky">{report.language || "ru"}</StatusBadge>
                  <StatusBadge tone={report.status === "approved" ? "emerald" : "amber"}>
                    {report.status || "created"}
                  </StatusBadge>
                </div>
                <h3 className="mt-3 text-lg font-black">{report.title || `Отчёт #${report.id}`}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{report.text}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{formatDate(report.created_at)}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuthorRewardsPanel({
  projectId,
  currency,
}: {
  projectId: number;
  currency: string;
}) {
  const rewardsQuery = useProjectRewards(projectId);
  const createRewardMutation = useCreateProjectReward(projectId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("1000");
  const [quantityTotal, setQuantityTotal] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);

  const rewards = rewardsQuery.data ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Добавить reward</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();

              createRewardMutation.mutate(
                {
                  title,
                  description,
                  amount: Number(amount),
                  currency,
                  quantity_total: quantityTotal ? Number(quantityTotal) : null,
                  sort_order: Number(sortOrder),
                  is_active: isActive,
                },
                {
                  onSuccess: () => {
                    setTitle("");
                    setDescription("");
                    setAmount("1000");
                    setQuantityTotal("");
                    setSortOrder("1");
                    setIsActive(true);
                  },
                },
              );
            }}
          >
            <Input label="Название" value={title} onChange={(event) => setTitle(event.target.value)} />

            <Textarea
              label="Описание"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <Input
              label="Минимальная сумма"
              type="number"
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            <Input
              label="Количество"
              type="number"
              placeholder="Пусто = без ограничения"
              value={quantityTotal}
              onChange={(event) => setQuantityTotal(event.target.value)}
            />

            <Input
              label="Порядок"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-800">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              <span>Активен</span>
            </label>

            {createRewardMutation.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                {getApiErrorMessage(createRewardMutation.error)}
              </div>
            ) : null}

            <Button
              type="submit"
              isLoading={createRewardMutation.isPending}
              disabled={title.trim().length < 2 || Number(amount) < 0}
            >
              Создать reward
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward-пакеты</CardTitle>
        </CardHeader>
        <CardContent>
          {rewardsQuery.isLoading ? <LoadingState text="Загружаем rewards..." /> : null}
          {rewardsQuery.isError ? <ErrorState description="Не удалось загрузить rewards." /> : null}

          {!rewardsQuery.isLoading && !rewardsQuery.isError && rewards.length === 0 ? (
            <EmptyState title="Reward-пакетов пока нет" />
          ) : null}

          <div className="space-y-4">
            {rewards.map((reward) => (
              <article key={reward.id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={reward.is_active !== false ? "emerald" : "amber"}>
                    {reward.is_active !== false ? "Активен" : "Выключен"}
                  </StatusBadge>
                  <StatusBadge tone="sky">
                    {formatMoney(reward.amount ?? 0, reward.currency ?? currency)}
                  </StatusBadge>
                </div>
                <h3 className="mt-3 text-lg font-black">{reward.title || `Reward #${reward.id}`}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{reward.description}</p>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
