import { useEffect, useState } from "react";

import type {
  AdminStaticTranslation,
  AdminStaticTranslationCreateRequest,
} from "@/features/admin/api/adminTypes";
import {
  useCreateAdminTranslation,
  useUpdateAdminTranslation,
} from "@/features/admin/hooks/useAdminTranslationMutations";
import { getApiErrorMessage } from "@/shared/api";
import { Button, Input, Modal, Tabs, Textarea } from "@/shared/ui";

type LanguageCode = "ru" | "kg" | "en";

type TranslationModalProps = {
  translation: AdminStaticTranslation | null;
  isOpen: boolean;
  onClose: () => void;
};

const languages: LanguageCode[] = ["ru", "kg", "en"];

const languageLabels: Record<LanguageCode, string> = {
  ru: "Русский",
  kg: "Кыргызский",
  en: "English",
};

function createInitialPayload(
  translation: AdminStaticTranslation | null,
): AdminStaticTranslationCreateRequest {
  if (!translation) {
    return {
      namespace: "common",
      key: "",
      values: {
        ru: "",
        kg: "",
        en: "",
      },
      description: "",
    };
  }

  const record = translation as unknown as Record<string, unknown>;
  const values =
    translation.values && typeof translation.values === "object"
      ? translation.values
      : {
          ru: typeof record.ru === "string" ? record.ru : "",
          kg: typeof record.kg === "string" ? record.kg : "",
          en: typeof record.en === "string" ? record.en : "",
        };

  return {
    namespace: translation.namespace,
    key: translation.key,
    values: {
      ru: values.ru ?? "",
      kg: values.kg ?? "",
      en: values.en ?? "",
    },
    description: translation.description ?? "",
  };
}

export function TranslationModal({
  translation,
  isOpen,
  onClose,
}: TranslationModalProps) {
  const createMutation = useCreateAdminTranslation();
  const updateMutation = useUpdateAdminTranslation();

  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("ru");
  const [payload, setPayload] = useState<AdminStaticTranslationCreateRequest>(() =>
    createInitialPayload(translation),
  );

  useEffect(() => {
    if (isOpen) {
      setPayload(createInitialPayload(translation));
      setActiveLanguage("ru");
    }
  }, [isOpen, translation]);

  const mutation = translation ? updateMutation : createMutation;
  const error = createMutation.error ?? updateMutation.error;

  function updateValue(language: LanguageCode, value: string) {
    setPayload((current) => ({
      ...current,
      values: {
        ...current.values,
        [language]: value,
      },
    }));
  }

  function submit() {
    const cleanedPayload: AdminStaticTranslationCreateRequest = {
      ...payload,
      description: payload.description || null,
    };

    if (translation) {
      updateMutation.mutate(
        {
          translationId: translation.id,
          payload: cleanedPayload,
        },
        {
          onSuccess: onClose,
        },
      );
      return;
    }

    createMutation.mutate(cleanedPayload, {
      onSuccess: onClose,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      title={translation ? "Редактировать перевод" : "Создать перевод"}
      onClose={onClose}
      className="sm:max-w-3xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" isLoading={mutation.isPending} onClick={submit}>
            {translation ? "Сохранить" : "Создать"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Namespace"
            placeholder="common"
            value={payload.namespace}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                namespace: event.target.value,
              }))
            }
          />

          <Input
            label="Key"
            placeholder="navigation.home"
            value={payload.key}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                key: event.target.value,
              }))
            }
          />
        </div>

        <Textarea
          label="Описание для разработчика"
          value={payload.description ?? ""}
          onChange={(event) =>
            setPayload((current) => ({
              ...current,
              description: event.target.value,
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
              <Textarea
                label={`Значение ${languageLabels[language]}`}
                value={payload.values[language]}
                onChange={(event) => updateValue(language, event.target.value)}
                rows={6}
              />
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
