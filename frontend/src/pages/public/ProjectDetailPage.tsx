import { AlertTriangle, MapPin } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ProjectFundingCard } from "@/features/projects/components/ProjectFundingCard";
import { useProject } from "@/features/projects/hooks/useProject";
import { getTranslation } from "@/shared/lib/getTranslation";
import {
  getHumanLabel,
  projectStatusLabels,
  projectTypeLabels,
} from "@/shared/lib/statusLabels";
import type { LanguageCode } from "@/shared/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  StatusBadge,
} from "@/shared/ui";

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const projectQuery = useProject(slug);
  const project = projectQuery.data;

  if (projectQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-12">
        <LoadingState text="Загружаем проект..." />
      </main>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-12">
        <ErrorState
          title="Проект не найден"
          description="Не удалось загрузить проект из backend API. Проверьте slug или seed-данные."
        />
      </main>
    );
  }

  const translation = getTranslation(project.translations, language);
  const title = translation?.title ?? "Проект без названия";
  const shortDescription =
    translation?.short_description ?? "Краткое описание проекта пока не заполнено.";
  const description =
    translation?.description ?? "Полное описание проекта пока не заполнено.";
  const risks = translation?.risks;
  const refundPolicy = translation?.refund_policy;
  const categoryNames =
    project.categories
      ?.map((category) => getTranslation(category.translations, language)?.name ?? category.slug)
      .filter(Boolean) ?? [];

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:py-12 lg:grid-cols-[1fr_390px]">
      <section className="min-w-0 space-y-6">
        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex min-h-[280px] items-center justify-center bg-gradient-to-br from-emerald-100 via-amber-50 to-white p-8 text-center dark:from-emerald-950/40 dark:via-amber-950/20 dark:to-slate-900 md:min-h-[380px]">
            <div>
              <StatusBadge tone="amber">TEST MODE</StatusBadge>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                {title}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                {shortDescription}
              </p>
            </div>
          </div>

          <div className="space-y-5 p-5 md:p-7">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="emerald">
                {getHumanLabel(projectStatusLabels, project.status)}
              </StatusBadge>
              <StatusBadge tone="slate">
                {getHumanLabel(projectTypeLabels, project.project_type)}
              </StatusBadge>
              {categoryNames.map((name) => (
                <StatusBadge key={name} tone="sky">
                  {name}
                </StatusBadge>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              <MapPin size={16} />
              {project.city || "Кыргызстан"}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>О проекте</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              {description}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Риски</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {risks || "Автор проекта пока не добавил отдельное описание рисков."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Условия возврата</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {refundPolicy || "Условия возврата пока не указаны автором."}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent>
            <div className="flex gap-3">
              <AlertTriangle className="shrink-0 text-amber-700 dark:text-amber-200" />
              <div>
                <h2 className="font-black text-amber-900 dark:text-amber-100">
                  Важное предупреждение
                </h2>
                <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-100">
                  Поддержка проекта не является инвестицией. Доход, проценты,
                  дивиденды или прибыль не гарантируются. Платформа работает в
                  тестовом режиме, реальные деньги не списываются.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <ProjectFundingCard project={project} />
    </main>
  );
}
