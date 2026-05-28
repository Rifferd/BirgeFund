import { FormEvent, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../../features/projects/hooks/useProject";
import { MockPaymentModal } from "../../features/payments/components/MockPaymentModal";
import { LoadingState } from "../../shared/ui/LoadingState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { Button } from "../../shared/ui/Button";
import { formatMoney } from "../../shared/lib/formatMoney";
import {
  getProjectRewards,
  getProjectTitle,
} from "../../entities/project/helpers";

export function SupportProjectPage() {
  const { slug } = useParams();
  const { data: project, isLoading, isError, error } = useProject(slug);

  const [amount, setAmount] = useState(1000);
  const [rewardId, setRewardId] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [comment, setComment] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const rewards = useMemo(() => (project ? getProjectRewards(project) : []), [project]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!accepted || amount <= 0) return;

    setModalOpen(true);
  }

  if (isLoading) {
    return <main className="container-page py-10"><LoadingState /></main>;
  }

  if (isError || !project) {
    return (
      <main className="container-page py-10">
        <ErrorState message={error instanceof Error ? error.message : "Проект не найден"} />
      </main>
    );
  }

  return (
    <main className="container-page max-w-3xl py-8 md:py-12">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-wide text-primary">Тестовая поддержка</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">{getProjectTitle(project)}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[32px] border border-border bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:p-7">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          TEST MODE: реальные деньги не списываются. Номер карты, CVV и банковские данные не вводятся.
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold">Сумма поддержки</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="min-h-11 w-full rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        {rewards.length > 0 && (
          <label className="block">
            <span className="mb-2 block text-sm font-bold">Вознаграждение</span>
            <select
              value={rewardId}
              onChange={(event) => {
                const value = event.target.value;
                setRewardId(value);

                const selectedReward = rewards.find((reward) => String(reward.id) === value);
                if (selectedReward) {
                  setAmount(Number(selectedReward.amount));
                }
              }}
              className="min-h-11 w-full rounded-2xl border border-border px-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Без вознаграждения</option>
              {rewards.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.title || "Вознаграждение"} — {formatMoney(reward.amount)}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-bold">Комментарий</span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-border p-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-950"
            placeholder="Можно оставить короткое сообщение автору"
          />
        </label>

        <label className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-800">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
            className="mt-1"
          />
          Поддержать анонимно
        </label>

        <label className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4 text-sm font-semibold dark:bg-slate-800">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-1"
          />
          Я понимаю, что это тестовый режим, реальные деньги не списываются, а поддержка проекта не является инвестицией.
        </label>

        <Button type="submit" disabled={!accepted || amount <= 0} className="w-full">
          Продолжить к тестовой оплате
        </Button>
      </form>

      <MockPaymentModal
        open={modalOpen}
        projectId={project.id}
        rewardId={rewardId || null}
        amount={amount}
        isAnonymous={isAnonymous}
        comment={comment}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
