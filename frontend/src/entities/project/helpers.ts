import type { Project, ProjectCategory, ProjectReward, ProjectTranslation } from "./types";

function findRuTranslation(translations?: ProjectTranslation[]) {
  return translations?.find((item) => item.language === "ru" || item.locale === "ru");
}

export function getProjectTitle(project: Project) {
  return project.title || findRuTranslation(project.translations)?.title || "Без названия";
}

export function getProjectShortDescription(project: Project) {
  return (
    project.short_description ||
    findRuTranslation(project.translations)?.short_description ||
    "Описание пока не добавлено"
  );
}

export function getProjectDescription(project: Project) {
  return (
    project.description ||
    findRuTranslation(project.translations)?.description ||
    getProjectShortDescription(project)
  );
}

export function getProjectRisks(project: Project) {
  return project.risks || findRuTranslation(project.translations)?.risks || "";
}

export function getProjectRefundPolicy(project: Project) {
  return project.refund_policy || findRuTranslation(project.translations)?.refund_policy || "";
}

export function getProjectSlug(project: Project) {
  return project.slug || String(project.id);
}

export function getProjectType(project: Project) {
  return project.project_type || project.type || "";
}

export function getProjectGoal(project: Project) {
  return Number(project.goal_amount ?? project.target_amount ?? project.goal ?? 0);
}

export function getProjectCollected(project: Project) {
  return Number(project.gross_collected ?? project.collected_amount ?? project.collected ?? 0);
}

export function getProjectProgress(project: Project) {
  const goal = getProjectGoal(project);
  const collected = getProjectCollected(project);

  if (goal <= 0) return 0;

  return Math.min(Math.round((collected / goal) * 100), 100);
}

export function getProjectImage(project: Project) {
  return (
    project.cover_image_url ||
    project.main_image_url ||
    project.image_url ||
    project.images?.[0]?.url ||
    project.images?.[0]?.file_url ||
    project.images?.[0]?.image_url ||
    ""
  );
}

export function getProjectCategory(project: Project) {
  const category = project.category;

  if (typeof category === "string") {
    return category;
  }

  if (category) {
    return getCategoryTitle(category);
  }

  const firstCategory = project.categories?.[0];

  if (firstCategory) {
    return getCategoryTitle(firstCategory);
  }

  return "Категория не указана";
}

export function getCategoryTitle(category: ProjectCategory) {
  return category.title || category.name || findRuTranslation(category.translations)?.title || "Категория";
}

export function getProjectDaysLeft(project: Project) {
  if (typeof project.days_left === "number") {
    return project.days_left;
  }

  if (!project.deadline) {
    return null;
  }

  const deadlineTime = new Date(project.deadline).getTime();

  if (Number.isNaN(deadlineTime)) {
    return null;
  }

  const diff = deadlineTime - Date.now();

  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
}

export function getProjectRewards(project: Project): ProjectReward[] {
  return project.rewards ?? [];
}

export function getAuthorName(project: Project) {
  return (
    project.author?.display_name ||
    project.author?.full_name ||
    project.author?.name ||
    "Автор не указан"
  );
}
