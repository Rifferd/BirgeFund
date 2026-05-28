import { useEffect, useState } from "react";

import type {
  AdminBanner,
  AdminBannerCreateRequest,
} from "@/features/admin/api/adminTypes";
import {
  useCreateAdminBanner,
  useUpdateAdminBanner,
} from "@/features/admin/hooks/useAdminBannerMutations";
import { getApiErrorMessage } from "@/shared/api";
import {
  Button,
  Input,
  Modal,
  Select,
  Tabs,
  Textarea,
} from "@/shared/ui";

type LanguageCode = "ru" | "kg" | "en";

type BannerModalProps = {
  banner: AdminBanner | null;
  isOpen: boolean;
  onClose: () => void;
};

const languages: LanguageCode[] = ["ru", "kg", "en"];

const languageLabels: Record<LanguageCode, string> = {
  ru: "Русский",
  kg: "Кыргызский",
  en: "English",
};

const placementOptions = [
  { value: "home_hero", label: "Главный экран" },
  { value: "home_top", label: "Верх главной" },
  { value: "home_middle", label: "Середина главной" },
  { value: "project_detail", label: "Страница проекта" },
  { value: "dashboard", label: "Личный кабинет" },
];

function createEmptyTranslation(language: LanguageCode) {
  return {
    language,
    title: "",
    subtitle: "",
    cta_text: "",
  };
}

function createInitialPayload(banner: AdminBanner | null): AdminBannerCreateRequest {
  if (!banner) {
    return {
      slug: `banner-${Date.now()}`,
      placement: "home_hero",
      image_file_id: null,
      link_url: "/projects",
      sort_order: 1,
      is_active: true,
      starts_at: null,
      ends_at: null,
      translations: languages.map(createEmptyTranslation),
    };
  }

  return {
    slug: banner.slug,
    placement: banner.placement,
    image_file_id: banner.image_file_id ?? null,
    link_url: banner.link_url ?? "",
    sort_order: banner.sort_order ?? 1,
    is_active: banner.is_active,
    starts_at: banner.starts_at ?? null,
    ends_at: banner.ends_at ?? null,
    translations: languages.map((language) => {
      const existing = banner.translations.find((item) => item.language === language);

      return {
        language,
        title: existing?.title ?? "",
        subtitle: existing?.subtitle ?? "",
        cta_text: existing?.cta_text ?? "",
      };
    }),
  };
}

export function BannerModal({ banner, isOpen, onClose }: BannerModalProps) {
  const createMutation = useCreateAdminBanner();
  const updateMutation = useUpdateAdminBanner();

  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("ru");
  const [payload, setPayload] = useState<AdminBannerCreateRequest>(() =>
    createInitialPayload(banner),
  );

  useEffect(() => {
    if (isOpen) {
      setPayload(createInitialPayload(banner));
      setActiveLanguage("ru");
    }
  }, [isOpen, banner]);

  const activeTranslationIndex = payload.translations.findIndex(
    (item) => item.language === activeLanguage,
  );
  const activeTranslation = payload.translations[activeTranslationIndex];

  const mutation = banner ? updateMutation : createMutation;
  const error = createMutation.error ?? updateMutation.error;

  function updateTranslation(
    field: keyof AdminBannerCreateRequest["translations"][number],
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
    const cleanedPayload: AdminBannerCreateRequest = {
      ...payload,
      image_file_id: payload.image_file_id || null,
      link_url: payload.link_url || null,
      starts_at: payload.starts_at || null,
      ends_at: payload.ends_at || null,
      translations: payload.translations.map((translation) => ({
        ...translation,
        subtitle: translation.subtitle || null,
        cta_text: translation.cta_text || null,
      })),
    };

    if (banner) {
      updateMutation.mutate(
        {
          bannerId: banner.id,
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
      title={banner ? "Редактировать баннер" : "Создать баннер"}
      onClose={onClose}
      className="sm:max-w-3xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" isLoading={mutation.isPending} onClick={submit}>
            {banner ? "Сохранить" : "Создать"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Slug"
            value={payload.slug}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                slug: event.target.value,
              }))
            }
          />

          <Select
            label="Placement"
            value={payload.placement}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                placement: event.target.value,
              }))
            }
          >
            {placementOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          <Input
            label="Link URL"
            placeholder="/projects"
            value={payload.link_url ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                link_url: event.target.value,
              }))
            }
          />

          <Input
            label="Sort order"
            type="number"
            value={payload.sort_order}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                sort_order: Number(event.target.value),
              }))
            }
          />

          <Input
            label="Starts at"
            type="datetime-local"
            value={payload.starts_at ? payload.starts_at.slice(0, 16) : ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                starts_at: event.target.value || null,
              }))
            }
          />

          <Input
            label="Ends at"
            type="datetime-local"
            value={payload.ends_at ? payload.ends_at.slice(0, 16) : ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                ends_at: event.target.value || null,
              }))
            }
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5"
            checked={payload.is_active}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                is_active: event.target.checked,
              }))
            }
          />
          <span>Баннер активен</span>
        </label>

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
                  label="Подзаголовок"
                  value={activeTranslation.subtitle ?? ""}
                  onChange={(event) => updateTranslation("subtitle", event.target.value)}
                />

                <Input
                  label="Текст кнопки"
                  value={activeTranslation.cta_text ?? ""}
                  onChange={(event) => updateTranslation("cta_text", event.target.value)}
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
