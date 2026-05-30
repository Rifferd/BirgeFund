import { Link } from "react-router-dom";

import { useProjectRewards } from "@/features/rewards/hooks/useProjectRewards";
import { buildSupportProjectUrl } from "@/shared/config/routes";
import { formatMoney } from "@/shared/lib/formatMoney";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/shared/ui";

type ProjectRewardsSectionProps = {
  projectId: number;
  projectSlug: string;
  currency: string;
};

export function ProjectRewardsSection({
  projectId,
  projectSlug,
  currency,
}: ProjectRewardsSectionProps) {
  const rewardsQuery = useProjectRewards(projectId);
  const rewards =
    rewardsQuery.data
      ?.filter((reward) => reward.is_active !== false)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Вознаграждения</CardTitle>
      </CardHeader>

      <CardContent>
        {rewardsQuery.isLoading ? <LoadingState text="Загружаем вознаграждения..." /> : null}

        {rewardsQuery.isError ? (
          <ErrorState description="Не удалось загрузить вознаграждения проекта." />
        ) : null}

        {!rewardsQuery.isLoading && !rewardsQuery.isError && rewards.length === 0 ? (
          <EmptyState
            title="Вознаграждений нет"
            description="Этот проект можно поддержать любой суммой без выбора reward-пакета."
          />
        ) : null}

        {!rewardsQuery.isLoading && !rewardsQuery.isError && rewards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="emerald">
                    от {formatMoney(reward.amount ?? 0, reward.currency ?? currency)}
                  </StatusBadge>

                  {typeof reward.quantity_left === "number" ? (
                    <StatusBadge tone={reward.quantity_left > 0 ? "sky" : "red"}>
                      Осталось: {reward.quantity_left}
                    </StatusBadge>
                  ) : null}
                </div>

                <h3 className="mt-3 text-xl font-black">
                  {reward.title || `Вознаграждение #${reward.id}`}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {reward.description || "Описание вознаграждения пока не заполнено."}
                </p>

                <Link to={buildSupportProjectUrl(projectSlug)} className="mt-4 inline-flex">
                  <Button variant="secondary">Выбрать</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
