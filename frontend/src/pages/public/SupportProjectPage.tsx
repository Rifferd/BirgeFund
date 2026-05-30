import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SupportForm } from "@/features/payments/components/SupportForm";
import { useProject } from "@/features/projects/hooks/useProject";
import { buildProjectUrl } from "@/shared/config/routes";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import {
  Button,
  Card,
  CardContent,
  ErrorState,
  LoadingState,
  StatusBadge,
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
      <main className="mx-auto max-w-4xl px-5 py-12">
        <LoadingState text="Загружаем проект..." />
      </main>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12">
        <ErrorState
          title="Проект не найден"
          description="Не удалось загрузить проект для поддержки."
        />
      </main>
    );
  }

  const translation = getTranslation(project.translations, language);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-5 py-8 md:py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-5">
        <TestModeBanner />

        <Card>
          <CardContent>
            <StatusBadge tone="emerald">Поддержка проекта</StatusBadge>

            <h1 className="mt-4 text-3xl font-black leading-tight">
              {translation?.title ?? "Проект без названия"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {translation?.short_description ?? "Описание проекта пока не заполнено."}
            </p>

            <Link to={buildProjectUrl(project.slug)} className="mt-5 inline-flex">
              <Button variant="secondary">Вернуться к проекту</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <SupportForm project={project} />
    </main>
  );
}
