import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Category } from "@/entities/category/types";
import { useCreateProject } from "@/features/projects/hooks/useCreateProject";
import {
  projectCreateSchema,
  type ProjectCreateFormValues,
} from "@/features/projects/schemas/projectCreateSchema";
import { getApiErrorMessage } from "@/shared/api";
import { getTranslation } from "@/shared/lib/getTranslation";
import type { LanguageCode } from "@/shared/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  StatusBadge,
  Tabs,
  TestModeBanner,
  Textarea,
} from "@/shared/ui";

const steps = [
  "Основное",
  "Переводы",
  "Финансы",
  "Риски",
  "Предпросмотр",
] as const;

const languageLabels: Record<LanguageCode, string> = {
  ru: "Русский",
  kg: "Кыргызский",
  en: "English",
};

function createInitialValues(): ProjectCreateFormValues {
  return {
    slug: `demo-project-${Date.now()}`,
    city: "Бишкек",
    project_type: "donation",
    funding_type: "flexible_funding",
    goal_amount: 100000,
    currency: "KGS",
    deadline: "2026-12-31",
    category_ids: [],
    translations: [
      {
        language: "ru",
        title: "",
        short_description: "",
        description: "",
        risks: "Сроки реализации проекта могут измениться.",
        refund_policy: "Платформа работает в тестовом режиме. Реальные деньги не списываются.",
        reward_description: "",
        report_text: "Автор будет публиковать новости и отчёты о ходе проекта.",
      },
      {
        language: "kg",
        title: "",
        short_description: "",
        description: "",
        risks: "Долбоорду ишке ашыруу мөөнөтү өзгөрүшү мүмкүн.",
        refund_policy: "Платформа тест режиминде иштейт. Чыныгы акча алынбайт.",
        reward_description: "",
        report_text: "Автор долбоордун жүрүшү тууралуу жаңылыктарды жана отчётторду жарыялайт.",
      },
      {
        language: "en",
        title: "",
        short_description: "",
        description: "",
        risks: "Project implementation dates may change.",
        refund_policy: "The platform works in test mode. No real money is charged.",
        reward_description: "",
        report_text: "The author will publish updates and reports about project progress.",
      },
    ],
  };
}

type ProjectWizardProps = {
  categories: Category[];
  language: LanguageCode;
};

export function ProjectWizard({ categories, language }: ProjectWizardProps) {
  const navigate = useNavigate();
  const createMutation = useCreateProject();

  const [stepIndex, setStepIndex] = useState(0);
  const [activeTranslationLanguage, setActiveTranslationLanguage] =
    useState<LanguageCode>("ru");
  const [values, setValues] = useState<ProjectCreateFormValues>(() => createInitialValues());
  const [formError, setFormError] = useState<string | null>(null);

  const activeTranslationIndex = values.translations.findIndex(
    (translation) => translation.language === activeTranslationLanguage,
  );

  const activeTranslation = values.translations[activeTranslationIndex];

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === values.category_ids[0]);
  }, [categories, values.category_ids]);

  function updateValue<TKey extends keyof ProjectCreateFormValues>(
    key: TKey,
    value: ProjectCreateFormValues[TKey],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateTranslation(field: keyof ProjectCreateFormValues["translations"][number], value: string) {
    setValues((current) => {
      const nextTranslations = [...current.translations];
      nextTranslations[activeTranslationIndex] = {
        ...nextTranslations[activeTranslationIndex],
        [field]: value,
      };

      return {
        ...current,
        translations: nextTranslations,
      };
    });
  }

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function submit() {
    setFormError(null);

    const result = projectCreateSchema.safeParse(values);

    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Проверьте форму");
      return;
    }

    createMutation.mutate(result.data, {
      onSuccess: () => {
        navigate("/author/projects");
      },
      onError: (error) => {
        setFormError(getApiErrorMessage(error));
      },
    });
  }

  return (
    <div className="space-y-5">
      <TestModeBanner compact />

      <Card>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto">
            {steps.map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => setStepIndex(index)}
                className={
                  index === stepIndex
                    ? "min-h-11 shrink-0 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white dark:bg-emerald-600"
                    : "min-h-11 shrink-0 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }
              >
                {index + 1}. {step}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {stepIndex === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Slug проекта"
                value={values.slug}
                onChange={(event) => updateValue("slug", event.target.value)}
              />

              <Input
                label="Город"
                value={values.city}
                onChange={(event) => updateValue("city", event.target.value)}
              />

              <Select
                label="Тип проекта"
                value={values.project_type}
                onChange={(event) => updateValue("project_type", event.target.value)}
              >
                <option value="donation">Благотворительная поддержка</option>
                <option value="reward">Поддержка с вознаграждением</option>
                <option value="preorder">Предзаказ</option>
                <option value="business_support">Поддержка бизнеса</option>
              </Select>

              <Select
                label="Категория"
                value={values.category_ids[0] ?? ""}
                onChange={(event) => updateValue("category_ids", [Number(event.target.value)])}
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => {
                  const translation = getTranslation(category.translations, language);

                  return (
                    <option key={category.id} value={category.id}>
                      {translation?.name ?? category.slug}
                    </option>
                  );
                })}
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {stepIndex === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Переводы ru / kg / en</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTranslationLanguage}
              onChange={(value) => setActiveTranslationLanguage(value as LanguageCode)}
              items={values.translations.map((translation) => ({
                value: translation.language,
                label: languageLabels[translation.language],
                content: (
                  <div className="grid gap-5">
                    <Input
                      label="Название проекта"
                      value={activeTranslation.title}
                      onChange={(event) => updateTranslation("title", event.target.value)}
                    />

                    <Textarea
                      label="Краткое описание"
                      value={activeTranslation.short_description}
                      onChange={(event) =>
                        updateTranslation("short_description", event.target.value)
                      }
                    />

                    <Textarea
                      label="Полное описание"
                      value={activeTranslation.description}
                      onChange={(event) => updateTranslation("description", event.target.value)}
                    />

                    <Textarea
                      label="Текст для отчётов"
                      value={activeTranslation.report_text ?? ""}
                      onChange={(event) => updateTranslation("report_text", event.target.value)}
                    />
                  </div>
                ),
              }))}
            />
          </CardContent>
        </Card>
      ) : null}

      {stepIndex === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Цель и дедлайн</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Цель сбора, сом"
                type="number"
                min={1000}
                step={1000}
                value={values.goal_amount}
                onChange={(event) => updateValue("goal_amount", Number(event.target.value))}
              />

              <Input
                label="Дедлайн"
                type="date"
                value={values.deadline}
                onChange={(event) => updateValue("deadline", event.target.value)}
              />

              <Select
                label="Тип сбора"
                value={values.funding_type}
                onChange={(event) => updateValue("funding_type", event.target.value)}
              >
                <option value="flexible_funding">Гибкий сбор</option>
                <option value="all_or_nothing">Всё или ничего</option>
              </Select>

              <Input label="Валюта" value={values.currency} disabled />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {stepIndex === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>Риски и условия возврата</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTranslationLanguage}
              onChange={(value) => setActiveTranslationLanguage(value as LanguageCode)}
              items={values.translations.map((translation) => ({
                value: translation.language,
                label: languageLabels[translation.language],
                content: (
                  <div className="grid gap-5">
                    <Textarea
                      label="Риски"
                      value={activeTranslation.risks ?? ""}
                      onChange={(event) => updateTranslation("risks", event.target.value)}
                    />

                    <Textarea
                      label="Условия возврата"
                      value={activeTranslation.refund_policy ?? ""}
                      onChange={(event) => updateTranslation("refund_policy", event.target.value)}
                    />

                    <Textarea
                      label="Описание вознаграждения"
                      value={activeTranslation.reward_description ?? ""}
                      onChange={(event) =>
                        updateTranslation("reward_description", event.target.value)
                      }
                    />
                  </div>
                ),
              }))}
            />
          </CardContent>
        </Card>
      ) : null}

      {stepIndex === 4 ? (
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="amber">Черновик</StatusBadge>
                  <StatusBadge tone="slate">{values.project_type}</StatusBadge>
                  <StatusBadge tone="sky">
                    {selectedCategory
                      ? getTranslation(selectedCategory.translations, language)?.name ??
                        selectedCategory.slug
                      : "Категория не выбрана"}
                  </StatusBadge>
                </div>

                <h2 className="mt-4 text-2xl font-black">
                  {values.translations[0]?.title || "Название проекта"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {values.translations[0]?.short_description || "Краткое описание"}
                </p>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <p><b>Город:</b> {values.city}</p>
                  <p><b>Цель:</b> {values.goal_amount} сом</p>
                  <p><b>Дедлайн:</b> {values.deadline}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                После создания проект будет сохранён как черновик. Отправка на модерацию выполняется из списка “Мои проекты”.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {formError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {formError}
        </div>
      ) : null}

      {createMutation.isSuccess ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 size={20} />
          Проект создан
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          disabled={stepIndex === 0}
          onClick={goBack}
        >
          Назад
        </Button>

        {stepIndex < steps.length - 1 ? (
          <Button type="button" onClick={goNext}>
            Далее
          </Button>
        ) : (
          <Button
            type="button"
            isLoading={createMutation.isPending}
            onClick={submit}
          >
            Создать черновик
          </Button>
        )}
      </div>
    </div>
  );
}
