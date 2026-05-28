export const projectStatusLabels: Record<string, string> = {
  draft: "Черновик",
  pending_review: "Ожидает проверки",
  approved: "Одобрен",
  rejected: "Отклонён",
  fundraising: "Идёт сбор",
  funded: "Цель собрана",
  in_progress: "В работе",
  completed: "Завершён",
  failed: "Не собран",
  cancelled: "Отменён",
  frozen: "Временно заморожен",
};

export const projectTypeLabels: Record<string, string> = {
  donation: "Благотворительная поддержка",
  reward: "Поддержка с вознаграждением",
  preorder: "Предзаказ",
  pre_order: "Предзаказ",
  business_support: "Поддержка бизнеса",
};

export function getStatusLabel(status?: string | null) {
  if (!status) return "Статус не указан";
  return projectStatusLabels[status] ?? status;
}

export function getProjectTypeLabel(type?: string | null) {
  if (!type) return "Тип не указан";
  return projectTypeLabels[type] ?? type;
}
