import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useProject } from "@/features/projects/hooks/useProject";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  TestModeBanner,
} from "@/shared/ui";

export function SupportProjectPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const projectQuery = useProject(slug);
  const project = projectQuery.data;

  if (projectQuery.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <LoadingState text="Загружаем проект..." />
      </main>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <ErrorState
          title="Проект не найден"
          description="Не удалось загрузить проект для поддержки."
        />
      </main>
    );
  }

  const translation = getTranslation(project.translations, language);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:py-12">
      <div className="mb-6">
        <TestModeBanner />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Поддержать проект</CardTitle>
        </CardHeader>
        <CardContent>
          <h1 className="text-2xl font-black">
            {translation?.title ?? "Проект без названия"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            На следующем этапе здесь будет форма выбора суммы, reward-пакета,
            публичности поддержки, комментария и mock payment modal. Реальные
            банковские данные вводить нельзя.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
