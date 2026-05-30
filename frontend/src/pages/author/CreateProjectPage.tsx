import { useTranslation } from "react-i18next";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { ProjectWizard } from "@/features/projects/components/ProjectWizard";
import type { LanguageCode } from "@/shared/types/api";
import { ErrorState, LoadingState, StatusBadge } from "@/shared/ui";

export function CreateProjectPage() {
  const { i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const categoriesQuery = useCategories();

  return (
    <div className="space-y-5">
      <div>
        <StatusBadge tone="amber">Создание проекта</StatusBadge>
        <h1 className="mt-3 text-3xl font-black">Новый проект</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Заполните черновик проекта. После создания его можно отправить на модерацию из раздела “Мои проекты”.
        </p>
      </div>

      {categoriesQuery.isLoading ? <LoadingState text="Загружаем категории..." /> : null}

      {categoriesQuery.isError ? (
        <ErrorState description="Не удалось загрузить категории для создания проекта." />
      ) : null}

      {!categoriesQuery.isLoading && !categoriesQuery.isError ? (
        <ProjectWizard categories={categoriesQuery.data ?? []} language={language} />
      ) : null}
    </div>
  );
}
