export const projectStatusLabels: Record<string, string> = {
  draft: "Черновик",
  pending_review: "Ожидает проверки",
  approved: "Одобрен",
  rejected: "Отклонён",
  fundraising: "Идёт сбор",
  funded: "Цель собрана",
  in_progress: "В работе",
  completed: "Завершён",
  failed: "Не собрал цель",
  cancelled: "Отменён",
  frozen: "Временно заморожен",
};

export const projectTypeLabels: Record<string, string> = {
  donation: "Благотворительная поддержка",
  reward: "Поддержка с вознаграждением",
  preorder: "Предзаказ",
  business_support: "Поддержка бизнеса",
};

export const paymentStatusLabels: Record<string, string> = {
  pending: "Ожидает подтверждения",
  success: "Успешно",
  failed: "Ошибка",
  cancelled: "Отменено",
};

export const complaintStatusLabels: Record<string, string> = {
  open: "Открыта",
  in_review: "На проверке",
  resolved: "Решена",
  rejected: "Отклонена",
};

export function getHumanLabel(map: Record<string, string>, value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return map[value] ?? value;
}
