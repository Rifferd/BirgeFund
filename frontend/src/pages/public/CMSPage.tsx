import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCMSPage } from "@/features/cms/hooks/useCMSPage";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import {
  Card,
  CardContent,
  ErrorState,
  LoadingState,
  StatusBadge,
  TestModeBanner,
} from "@/shared/ui";

export function CMSPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language as LanguageCode;

  const pageQuery = useCMSPage(slug);
  const page = pageQuery.data;

  if (pageQuery.isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12">
        <LoadingState text="Загружаем страницу..." />
      </main>
    );
  }

  if (pageQuery.isError || !page) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12">
        <ErrorState
          title="Страница не найдена"
          description="CMS-страницу не удалось загрузить из backend API."
        />
      </main>
    );
  }

  const translation = getTranslation(page.translations, language);

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
      <div className="mb-6">
        <TestModeBanner compact />
      </div>

      <Card>
        <CardContent>
          <StatusBadge tone="sky">CMS page</StatusBadge>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            {translation?.title ?? page.slug}
          </h1>

          <article className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-base leading-8 text-slate-700 dark:prose-invert dark:text-slate-200">
            {translation?.content ?? "Контент страницы пока не заполнен."}
          </article>
        </CardContent>
      </Card>
    </main>
  );
}
