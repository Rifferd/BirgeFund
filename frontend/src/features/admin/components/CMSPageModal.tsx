import { useEffect, useState } from "react";

import type {
  AdminCMSPage,
  AdminCMSPageCreateRequest,
} from "@/features/admin/api/adminTypes";
import {
  useCreateAdminCMSPage,
  useUpdateAdminCMSPage,
} from "@/features/admin/hooks/useAdminCMSPageMutations";
import { getApiErrorMessage } from "@/shared/api";
import { Button, Input, Modal, Tabs, Textarea } from "@/shared/ui";

type LanguageCode = "ru" | "kg" | "en";

type CMSPageModalProps = {
  page: AdminCMSPage | null;
  isOpen: boolean;
  onClose: () => void;
};

const languages: LanguageCode[] = ["ru", "kg", "en"];

const languageLabels: Record<LanguageCode, string> = {
  ru: "Русский",
  kg: "Кыргызский",
  en: "English",
};

function createEmptyTranslation(language: LanguageCode) {
  return {
    language,
    title: "",
    content: "",
    meta_title: "",
    meta_description: "",
  };
}

function createInitialPayload(page: AdminCMSPage | null): AdminCMSPageCreateRequest {
  if (!page) {
    return {
      slug: "",
      translations: languages.map(createEmptyTranslation),
    };
  }

  return {
    slug: page.slug,
    translations: languages.map((language) => {
      const existing = page.translations.find((item) => item.language === language);

      return {
        language,
        title: existing?.title ?? "",
        content: existing?.content ?? "",
        meta_title: existing?.meta_title ?? "",
        meta_description: existing?.meta_description ?? "",
      };
    }),
  };
}

export function CMSPageModal({ page, isOpen, onClose }: CMSPageModalProps) {
  const createMutation = useCreateAdminCMSPage();
  const updateMutation = useUpdateAdminCMSPage();

  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("ru");
  const [payload, setPayload] = useState<AdminCMSPageCreateRequest>(() =>
    createInitialPayload(page),
  );

  useEffect(() => {
    if (isOpen) {
      setPayload(createInitialPayload(page));
      setActiveLanguage("ru");
    }
  }, [isOpen, page]);

  const activeTranslationIndex = payload.translations.findIndex(
    (item) => item.language === activeLanguage,
  );
  const activeTranslation = payload.translations[activeTranslationIndex];

  const mutation = page ? updateMutation : createMutation;
  const error = createMutation.error ?? updateMutation.error;

  function updateTranslation(
    field: keyof AdminCMSPageCreateRequest["translations"][number],
    value: string,
  ) {
    setPayload((current) => {
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

  function submit() {
    if (page) {
      updateMutation.mutate(
        {
          pageId: page.id,
          payload,
        },
        {
          onSuccess: onClose,
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: onClose,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      title={page ? "Редактировать CMS-страницу" : "Создать CMS-страницу"}
      onClose={onClose}
      className="sm:max-w-3xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" isLoading={mutation.isPending} onClick={submit}>
            {page ? "Сохранить" : "Создать"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Input
          label="Slug страницы"
          placeholder="Например: test-mode"
          value={payload.slug}
          onChange={(event) =>
            setPayload((current) => ({
              ...current,
              slug: event.target.value,
            }))
          }
        />

        <Tabs
          value={activeLanguage}
          onChange={(value) => setActiveLanguage(value as LanguageCode)}
          items={languages.map((language) => ({
            value: language,
            label: languageLabels[language],
            content: (
              <div className="space-y-5">
                <Input
                  label="Заголовок"
                  value={activeTranslation.title}
                  onChange={(event) => updateTranslation("title", event.target.value)}
                />

                <Textarea
                  label="Контент"
                  value={activeTranslation.content}
                  onChange={(event) => updateTranslation("content", event.target.value)}
                  rows={10}
                />

                <Input
                  label="Meta title"
                  value={activeTranslation.meta_title ?? ""}
                  onChange={(event) => updateTranslation("meta_title", event.target.value)}
                />

                <Textarea
                  label="Meta description"
                  value={activeTranslation.meta_description ?? ""}
                  onChange={(event) =>
                    updateTranslation("meta_description", event.target.value)
                  }
                />
              </div>
            ),
          }))}
        />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {getApiErrorMessage(error)}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
